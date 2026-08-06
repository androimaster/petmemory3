// Supabase 클라이언트 초기화
const SUPABASE_URL = 'https://opwwsrpsqiojghaxjqmr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wd3dzcnBzcWlvamdoYXhqcW1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4MDY5NjEsImV4cCI6MjEwMTM4Mjk2MX0.jzxk-xgilPXcs7gX96bhvmcBr04Fy6ZB68qu5z0doWg';

// 라이브러리 백업
const _supabaseLib = window.supabase;

// 실제 사용하는 클라이언트
var supabase = null;

function initClient() {
  if (supabase) return supabase;

  const lib = _supabaseLib || window.supabase;
  if (lib && typeof lib.createClient === 'function') {
    supabase = lib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return supabase;
  }
  return null;
}

// 즉시 시도
initClient();

function getSupabase() {
  return initClient();
}

// ===== 인증 관련 함수 =====
async function getCurrentUser() {
  const client = getSupabase();
  if (!client) return null;
  const { data: { user } } = await client.auth.getUser();
  return user;
}

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

async function signOut() {
  const client = getSupabase();
  if (client) await client.auth.signOut();
  window.location.href = 'index.html';
}

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

// 전역 함수 노출
window.getCurrentUser = getCurrentUser;
window.getOrCreateProfile = getOrCreateProfile;
window.signOut = signOut;
window.signInWithGoogle = signInWithGoogle;
window.getSupabase = getSupabase;
