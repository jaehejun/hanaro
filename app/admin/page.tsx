'use client';

import { useEffect, useState } from 'react';

type Post = { id: string; title: string; content: string };
type User = { id: string; email: string; nickname: string };

const categories = ['javascript', 'typescript', 'react', 'etc'];

type Tab = 'posts' | 'users';

export default function AdminPage() {
  // 탭 상태
  const [activeTab, setActiveTab] = useState<Tab>('posts');

  // 게시글 관련 상태
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [editPost, setEditPost] = useState<Post | null>(null);

  // 사용자 관련 상태
  const [users, setUsers] = useState<User[]>([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchNickname, setSearchNickname] = useState('');

  // --- 게시글 함수 ---

  const fetchPosts = async (category: string) => {
    const res = await fetch(`/api/categories/${category}`);
    if (res.ok) {
      const data = await res.json();
      setPosts(data);
    }
  };

  useEffect(() => {
    if (activeTab === 'posts' && selectedCategory) {
      fetchPosts(selectedCategory);
      setEditPost(null);
    }
  }, [activeTab, selectedCategory]);

  const handlePostSubmit = async () => {
    if (!selectedCategory) return;
    const res = await fetch(`/api/categories/${selectedCategory}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newPost, category: selectedCategory }),
    });
    if (res.ok) {
      setNewPost({ title: '', content: '' });
      await fetchPosts(selectedCategory);
    }
  };

  const handleDeletePost = async (post_id: string) => {
    const res = await fetch(`/api/posts/${post_id}`, {
      method: 'DELETE',
    });
    if (res.ok) setPosts(posts.filter((post) => post.id !== post_id));
  };

  const handleStartEdit = (post: Post) => {
    setEditPost(post);
  };

  const handleEditChange = (field: 'title' | 'content', value: string) => {
    if (!editPost) return;
    setEditPost({ ...editPost, [field]: value });
  };

  const handleEditSubmit = async () => {
    if (!editPost) return;
    const res = await fetch(`/api/posts/${editPost.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editPost.title, content: editPost.content }),
    });
    if (res.ok && selectedCategory) {
      await fetchPosts(selectedCategory);
      setEditPost(null);
    }
  };

  const handleEditCancel = () => {
    setEditPost(null);
  };

  // --- 사용자 함수 ---

  const fetchUsers = async (email?: string, nickname?: string) => {
    let url = '/api/users';
    const params = new URLSearchParams();
    if (email) params.append('email', email);
    if (nickname) params.append('nickname', nickname);
    if (params.toString()) url += '?' + params.toString();

    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    }
  };

  // 사용자 관리 탭 진입 시 초기 사용자 목록 조회
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const handleUserSearch = () => {
    fetchUsers(searchEmail.trim(), searchNickname.trim());
  };

  return (
    <div style={{ display: 'flex' }}>
      {/* 좌측 탭 메뉴 */}
      <aside style={{ width: '200px', marginRight: '1rem' }}>
        <h3>관리자 메뉴</h3>
        <div>
          <button
            onClick={() => setActiveTab('posts')}
            style={{
              fontWeight: activeTab === 'posts' ? 'bold' : 'normal',
              textDecoration: activeTab === 'posts' ? 'underline' : 'none',
              display: 'block',
              marginBottom: '0.5rem',
            }}
          >
            게시글 관리
          </button>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              fontWeight: activeTab === 'users' ? 'bold' : 'normal',
              textDecoration: activeTab === 'users' ? 'underline' : 'none',
              display: 'block',
            }}
          >
            사용자 관리
          </button>
        </div>
      </aside>

      {/* 우측 내용 영역 */}
      <section style={{ flex: 1 }}>
        {activeTab === 'posts' && (
          <>
            <h3>게시글 관리</h3>
            <div style={{ marginBottom: '1rem' }}>
              <h4>카테고리</h4>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    fontWeight: cat === selectedCategory ? 'bold' : 'normal',
                    textDecoration: cat === selectedCategory ? 'underline' : 'none',
                    marginRight: '0.5rem',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {selectedCategory ? (
              <>
                {/* 새 글 작성 또는 수정 폼 */}
                {!editPost && (
                  <div style={{ marginBottom: '1rem' }}>
                    <input
                      placeholder="제목"
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    />
                    <textarea
                      placeholder="내용"
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    />
                    <button onClick={handlePostSubmit}>게시글 작성</button>
                  </div>
                )}
                {editPost && (
                  <div style={{ marginBottom: '1rem' }}>
                    <input
                      placeholder="제목"
                      value={editPost.title}
                      onChange={(e) => handleEditChange('title', e.target.value)}
                    />
                    <textarea
                      placeholder="내용"
                      value={editPost.content}
                      onChange={(e) => handleEditChange('content', e.target.value)}
                    />
                    <button onClick={handleEditSubmit}>수정 완료</button>
                    <button onClick={handleEditCancel} style={{ marginLeft: '0.5rem' }}>
                      수정 취소
                    </button>
                  </div>
                )}

                {/* 게시글 목록 */}
                <ul>
                  {posts.map((post) => (
                    <li key={post.id}>
                      <strong>{post.title}</strong>
                      <button onClick={() => handleStartEdit(post)} style={{ marginLeft: '1rem' }}>
                        수정
                      </button>
                      <button onClick={() => handleDeletePost(post.id)} style={{ marginLeft: '0.5rem' }}>
                        삭제
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p>카테고리를 선택하세요.</p>
            )}
          </>
        )}

        {activeTab === 'users' && (
          <>
            <h3>사용자 관리</h3>

            {/* 검색폼 */}
            <div style={{ marginBottom: '1rem' }}>
              <input
                placeholder="이메일 검색"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                style={{ marginRight: '0.5rem' }}
              />
              <input
                placeholder="닉네임 검색"
                value={searchNickname}
                onChange={(e) => setSearchNickname(e.target.value)}
                style={{ marginRight: '0.5rem' }}
              />
              <button onClick={handleUserSearch}>검색</button>
              <button
                onClick={() => {
                  setSearchEmail('');
                  setSearchNickname('');
                  fetchUsers();
                }}
                style={{ marginLeft: '0.5rem' }}
              >
                초기화
              </button>
            </div>

            {/* 사용자 목록 */}
            <table border={1} cellPadding={6} style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Nickname</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center' }}>
                      사용자 없음
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.email}</td>
                      <td>{user.nickname}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </>
        )}
      </section>
    </div>
  );
}


// // app/admin/page.tsx
// // 관리자 페이지

// 'use client';

// import { useEffect, useState } from 'react';

// const categories = ['javascript', 'typescript', 'react', 'etc'];

// export default function AdminPage() {
//   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
//   const [posts, setPosts] = useState<any[]>([]);
//   const [newPost, setNewPost] = useState({ title: '', content: '' });
//   const [editPost, setEditPost] = useState<{ id: string; title: string; content: string } | null>(null);

//   const fetchPosts = async (category: string) => {
//     const res = await fetch(`/api/categories/${category}`);
//     if (res.ok) {
//       const data = await res.json();
//       setPosts(data);
//     }
//   };

//   useEffect(() => {
//     if (!selectedCategory) return;
//     fetchPosts(selectedCategory);
//     setEditPost(null); // 카테고리 바뀌면 수정폼 초기화
//   }, [selectedCategory]);

//   // 새 게시글 작성
//   const handlePostSubmit = async () => {
//     if (!selectedCategory) return;
//     const res = await fetch(`/api/categories/${selectedCategory}`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ ...newPost, category: selectedCategory }),
//     });
//     if (res.ok) {
//       setNewPost({ title: '', content: '' });
//       await fetchPosts(selectedCategory);
//     }
//   };

//   // 게시글 삭제
//   const handleDelete = async (post_id: string) => {
//     const res = await fetch(`/api/posts/${post_id}`, {
//       method: 'DELETE',
//     });
//     if (res.ok) setPosts(posts.filter((post) => post.id !== post_id));
//   };

//   // 수정 버튼 누르면 수정 폼에 값 채워서 보여줌
//   const handleStartEdit = (post: any) => {
//     setEditPost({ id: post.id, title: post.title, content: post.content });
//   };

//   // 수정 폼의 입력값 변경
//   const handleEditChange = (field: 'title' | 'content', value: string) => {
//     if (!editPost) return;
//     setEditPost({ ...editPost, [field]: value });
//   };

//   // 수정 폼 제출
//   const handleEditSubmit = async () => {
//     if (!editPost) return;
//     const res = await fetch(`/api/posts/${editPost.id}`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ title: editPost.title, content: editPost.content }),
//     });
//     if (res.ok && selectedCategory) {
//       await fetchPosts(selectedCategory);
//       setEditPost(null); // 수정 완료 후 폼 닫기
//     }
//   };

//   // 수정 취소
//   const handleEditCancel = () => {
//     setEditPost(null);
//   };

//   return (
//     <div style={{ display: 'flex' }}>
//       <aside style={{ width: '200px', marginRight: '1rem' }}>
//         <h3>카테고리</h3>
//         {categories.map((cat) => (
//           <div key={cat}>
//             <button
//               onClick={() => setSelectedCategory(cat)}
//               style={{
//                 fontWeight: cat === selectedCategory ? 'bold' : 'normal',
//                 textDecoration: cat === selectedCategory ? 'underline' : 'none',
//               }}
//             >
//               {cat}
//             </button>
//           </div>
//         ))}
//       </aside>

//       <section style={{ flex: 1 }}>
//         {selectedCategory ? (
//           <>
//             <h3>{selectedCategory} 게시글</h3>

//             {/* 새 글 작성 */}
//             {!editPost && (
//               <div style={{ marginBottom: '1rem' }}>
//                 <input
//                   placeholder="제목"
//                   value={newPost.title}
//                   onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
//                 />
//                 <textarea
//                   placeholder="내용"
//                   value={newPost.content}
//                   onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
//                 />
//                 <button onClick={handlePostSubmit}>게시글 작성</button>
//               </div>
//             )}

//             {/* 수정 폼 */}
//             {editPost && (
//               <div style={{ marginBottom: '1rem' }}>
//                 <input
//                   placeholder="제목"
//                   value={editPost.title}
//                   onChange={(e) => handleEditChange('title', e.target.value)}
//                 />
//                 <textarea
//                   placeholder="내용"
//                   value={editPost.content}
//                   onChange={(e) => handleEditChange('content', e.target.value)}
//                 />
//                 <button onClick={handleEditSubmit}>수정 완료</button>
//                 <button onClick={handleEditCancel} style={{ marginLeft: '0.5rem' }}>
//                   수정 취소
//                 </button>
//               </div>
//             )}

//             {/* 게시글 목록 */}
//             <ul>
//               {posts.map((post) => (
//                 <li key={post.id}>
//                   <strong>{post.title}</strong>
//                   <button onClick={() => handleStartEdit(post)} style={{ marginLeft: '1rem' }}>
//                     수정
//                   </button>
//                   <button onClick={() => handleDelete(post.id)} style={{ marginLeft: '0.5rem' }}>
//                     삭제
//                   </button>
//                 </li>
//               ))}
//             </ul>
//           </>
//         ) : (
//           <p>카테고리를 선택하세요.</p>
//         )}
//       </section>
//     </div>
//   );
// }