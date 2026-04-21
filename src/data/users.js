/**
 * 사전 등록된 사용자 DB (데모용)
 * 실제 운영 시 서버 + 해시 비밀번호로 교체 필요
 */
export const USERS = [
  {
    id: 'admin-001',
    email: 'admin@covasystem.co.kr',
    password: '1q2w3e4r!',
    name: 'Cova Admin',
    role: 'admin',
    site: 'Demo Site — 여수 1호 (발효공장)',
    siteId: 'demo-site-01',
    isDemo: true,
  },
]

export function findUser(email, password) {
  return USERS.find(
    u => u.email === email && u.password === password
  ) || null
}
