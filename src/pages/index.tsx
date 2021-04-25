import { GetStaticProps } from 'next';
import Image from 'next/image';
import { usePlayer } from '../../contexts/PlayerContext';
import Head from "next/head";
import { format, parseISO } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

import { api } from '../../services/api';

import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

import Link from 'next/link';

import styles from './home.module.scss';

type Episode = {
  id: string;     
  title: string;
  members: string;
  publishedAt: string;
  thumbnail: string;
  url: string;
  duration: number;
  durationAsString: string,
}

type HomeProps = {
  latestEpisodes: Array<Episode>,
  allEpisodes: Array<Episode>
}

export default function Home({ latestEpisodes, allEpisodes }: HomeProps) {

  const { playList } = usePlayer();

  const episodeList = [...latestEpisodes, ...allEpisodes];
  
  return (
    <div className={styles.homePage}>
      <Head>
        <title>Home | Podcastr</title>
      </Head>
      <section className={styles.latestEpisodes}>
        <h2>Últimos lançamentos</h2>

        <ul>
          {latestEpisodes.map((episode, index) => {
            return (
              <li key={episode.id}>
                <Image 
                  width={192} 
                  height={192} 
                  src={episode.thumbnail} 
                  alt={episode.title}
                  objectFit="cover"
                />

                <div className={styles.episodeDetails}>
                  <Link href={`/episodes/${episode.id}`}>
                    <a>{episode.title}</a>
                  </Link>
                  <p>{episode.members}</p>
                  <span>{episode.publishedAt}</span>
                  <span>{episode.durationAsString}</span>
                </div>

                <button type="button" onClick={() => playList(episodeList, index)}>
                  <img src="/play-green.svg" alt="Tocar episódio"/>
                </button>
              </li>
            ) 
          })}
        </ul>
      </section>

      <section className={styles.allEpisodes}>
          <h2>Todos episódios</h2>
          <ul>
            {allEpisodes.map((episode, index) => {
              return (
                <li key={episode.id}>
                  <Image 
                    width={120} 
                    height={120} 
                    src={episode.thumbnail} 
                    alt={episode.title}
                    objectFit="cover"
                  />

                  <div className={styles.episodeDetails}>
                    <Link href={`/episodes/${episode.id}`}>
                      <a>{episode.title}</a>
                    </Link>
                    <p>{episode.members}</p>
                    <span>{episode.publishedAt}</span>
                    <span>{episode.durationAsString}</span>
                  </div>
                  
                  <button type="button" onClick={() => playList(episodeList, index + latestEpisodes.length)}>
                    <img src="/play-green.svg" alt="Tocar episódio"/>
                  </button>
                </li>
              )
            })}
          </ul>
    
      </section>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const { data } = await api.get('episodes', {
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  });

  const episodes = data.map(episode => {
    return {
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', { locale: ptBR}),
      duration: Number(episode.file.duration),
      durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
      url: episode.file.url,
    };
  });

  const latestEpisodes = episodes.slice(0, 2);
  const allEpisodes = episodes.slice (2, episodes.length);
  return {
    props: {
      latestEpisodes,
      allEpisodes,
    },
    revalidate: 60 * 60 * 8,
  }
}

// ---- SPA
// import { useEffect } from "react"
// useEffect(() => {
//   fetch('http:/localhost:3333/episodes')
//     .then(response => response.json())
//     .then(data => console.log(data))
// }, [])

// ---- SSR
// export async function getServerSideProps() {
//   const response = await fetch('http://localhost:3333/episodes');
//   const data = await response.json();

//   return {
//     props: {
//       episodes: data,
//     }
//   }
// }
