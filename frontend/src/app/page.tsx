
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: todos } = await supabase.from('todos').select();

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-xl w-full p-10 rounded-3xl bg-slate-900/80 border border-slate-800/70 shadow-blue-500/10 backdrop-blur-md flex flex-col items-center gap-6">
        <h1 className="text-4xl font-bold text-blue-400 mb-2">Bienvenue sur Unmute</h1>
        <p className="text-slate-300 text-lg text-center">Simulation médicale immersive avec IA vocale. <br/> Sélectionnez un scénario pour commencer votre session clinique.</p>
        <a href="/scenarios" className="mt-4 px-8 py-3 rounded-2xl bg-blue-500 text-white font-semibold text-lg shadow-blue-500/10 hover:bg-blue-600 transition-all">Démarrer</a>
      </div>
    </div>
  );
}
