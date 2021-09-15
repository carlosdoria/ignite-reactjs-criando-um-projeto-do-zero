import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Link from 'next/link';
import { useState } from 'react';
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
  const [next_page, setNextPage] = useState(postsPagination.next_page);

  return (
    <>
      {posts.map(post => (
        <div key={post.uid}>
          <Link href={`post/${post.uid}`}>{post.data.title}</Link>
          <p>{post.data.subtitle}</p>
          <footer>
            <time>
              {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
            </time>
            <p>{post.data.author}</p>
          </footer>
        </div>
      ))}

      {next_page && <button type="button">Carregar mais posts</button>}
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

  // eslint-disable-next-line no-console
  console.log(postsResponse.results[0].data);

  return {
    props: {
      postsPagination: {
        results: posts,
        next_page: postsResponse.next_page ? postsResponse.next_page : '',
      },
    },
  };
};
