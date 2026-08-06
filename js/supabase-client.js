// Supabase 클라이언트 초기화
const SUPABASE_URL = 'https://opwwsrpsqiojghaxjqmr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wd3dzcnBzcWlvamdoYXhqcW1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4MDY5NjEsImV4cCI6MjEwMTM4Mjk2MX0.jzxk-xgilPXcs7gX96bhvmcBr04Fy6ZB68qu5z0doWg';

// 페이지에서 사용하는 클라이언트
var sb = null;

function getSupabase() {
  if (sb) return sb;
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return sb;
  }
  return null;
}

// 현재 로그인한 사용자 가져오기
async function getCurrentUser() {
  const client = getSupabase();
  if (!client) return null;
  const { data: { user } } = await client.auth.getUser();
  return user;
}

// 프로필 가져오기 (없으면 생성)
async function getOrCreateProfile(user) {
  if (!user) return null;
  const client = getSupabase();
  if (!client) return null;

  const { data: profile, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error && error.code === 'PGRST116') {
    const { data: newProfile, error: insertError } = await client
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
  const client = getSupabase();
  if (client) await client.auth.signOut();
  window.location.href = 'index.html';
}

// 구글 로그인
async function signInWithGoogle() {
  const client = getSupabase();
  if (!client) {
    alert('잠시 후 다시 시도해주세요.');
    return;
  }
  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.href
    }
  });
  if (error) {
    console.error('구글 로그인 실패:', error);
    alert('로그인에 실패했습니다. 다시 시도해주세요.');
  }
}

// 전역 노출 (확실하게)
window.getCurrentUser = getCurrentUser;
window.getOrCreateProfile = getOrCreateProfile;
window.signOut = signOut;
window.signInWithGoogle = signInWithGoogle;
window.getSupabase = getSupabase;

// 기존 페이지 코드 호환 (supabase.from 사용 부분)
Object.defineProperty(window, 'supabase', {
  get: function() {
    // 라이브러리인지 클라이언트인지 구분
    if (sb) return sb;
    return getSupabase() || window._supabaseLib;
  },
  set: function(val) {
    // CDN이 라이브러리를 넣을 때 저장
    window._supabaseLib = val;
  },
  configurable: true
});
