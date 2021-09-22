import { GetStaticProps } from 'next';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Link from 'next/link';
import { useState } from 'react';
import { BiCalendarAlt, BiUser } from 'react-icons/bi';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  function loadMorePosts(): void {
    console.log(nextPage);
    fetch(nextPage)
      .then(res => {
        return res.json();
      })
      .then(response => {
        const loadedPosts = response.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: post.first_publication_date,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
          };
        });

        setPosts([...posts, ...loadedPosts]);
        setNextPage(response.next_page);
      });
  }
  return (
    <>
      <Head>
        <title>Home</title>
      </Head>

      <main className={commonStyles.container}>
        <div className={commonStyles.content}>
          {posts.map(post => (
            <Link key={post.uid} href={`post/${post.uid}`}>
              <a className={styles.post}>
                <h2>{post.data.title}</h2>
                <p>{post.data.subtitle}</p>
                <footer>
                  <span>
                    <BiCalendarAlt />
                    <time>
                      {format(
                        new Date(post.first_publication_date),
                        'dd MMM yyyy',
                        {
                          locale: ptBR,
                        }
                      )}
                    </time>
                  </span>
                  <span>
                    {' '}
                    <BiUser />
                    <small>{post.data.author}</small>
                  </span>
                </footer>
              </a>
            </Link>
          ))}
        </div>

        {nextPage && (
          <button type="button" onClick={loadMorePosts}>
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts'),
  ]);

  const posts = postsResponse.results.map(postResponse => {
    return {
      uid: postResponse.uid,
      first_publication_date: postResponse.first_publication_date,
      data: {
        title: postResponse.data.title,
        subtitle: postResponse.data.subtitle,
        author: postResponse.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        results: posts,
        next_page: postsResponse.next_page ? postsResponse.next_page : '',
      },
    },
  };
};
