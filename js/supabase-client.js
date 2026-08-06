// Supabase 클라이언트 초기화
const SUPABASE_URL = 'https://opwwsrpsqiojghaxjqmr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wd3dzcnBzcWlvamdoYXhqcW1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4MDY5NjEsImV4cCI6MjEwMTM4Mjk2MX0.jzxk-xgilPXcs7gX96bhvmcBr04Fy6ZB68qu5z0doWg';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 현재 로그인한 사용자 가져오기
async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// 프로필 가져오기 (없으면 생성)
async function getOrCreateProfile(user) {
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error && error.code === 'PGRST116') {
    // 프로필이 없으면 생성
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '사용자',
        plan: 'free'
      })
      .select()
      .single();

    if (insertError) {
      console.error('프로필 생성 실패:', insertError);
      return null;
    }
    return newProfile;
  }

  if (error) {
    console.error('프로필 조회 실패:', error);
    return null;
  }

  return profile;
}

// 로그아웃
async function signOut() {
  await supabase.auth.signOut();
  window.location.href = 'index.html';
}

// 구글 로그인
async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + window.location.pathname
    }
  });
  if (error) {
    console.error('구글 로그인 실패:', error);
    alert('로그인에 실패했습니다. 다시 시도해주세요.');
  }
}
