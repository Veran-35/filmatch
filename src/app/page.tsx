import { getNowPlaying, getTrending, discoverMovies } from '@/lib/tmdb'
import HomeClient from '@/components/homeClient'

export default async function HomePage() {
  // Ambil data awal di Server (Sangat aman dan tidak membebani browser)


  const [nowPlayingRes, trendingRes, discoverRes] = await Promise.all([
    getNowPlaying(),
    getTrending(),
    discoverMovies({
      sort_by: 'popularity.desc',
      'vote_count.gte': '80',
      page: '1'
    })
  ]);

  // Siapkan data Hero
  const heroPool = nowPlayingRes.results.filter(m => m.backdrop_path && m.overview);
  const hero = heroPool.length > 0 ? heroPool[0] : null;

  // Lempar data ke komponen UI
  return (
    <main>
      <HomeClient
        initialHero={hero}
        initialTrending={trendingRes.results.slice(0, 10)}
        initialFilms={discoverRes.results.slice(0, 20)}
      />
    </main>
  )
}