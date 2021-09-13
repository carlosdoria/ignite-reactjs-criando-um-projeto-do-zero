// import { GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useRouter } from 'next/router';
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
  const route = useRouter();

  function pushToPost(url: string) {
    route.push(`/post/${url}`);
  }

  return (
    <>
      {postsPagination.results.map(post => (
        <div key={post.uid}>
          <button type="button" onClick={() => pushToPost(post.uid)}>
            {post.data.title}
          </button>
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

      {postsPagination.next_page && (
        <button type="button">Carregar mais posts</button>
      )}
    </>
  );
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts'),
  ]);

  const posts = postsResponse.results.map(postResponse => {
    return {
      uid: postResponse.uid,
      first_publication_date: postResponse.first_publication_date,
      data: {
        title: postResponse.data.title[0].text,
        subtitle: postResponse.data.subtitle[0].text,
        author: postResponse.data.author[0].text,
      },
    };
  });

  // eslint-disable-next-line no-console
  // console.log(posts);

  return {
    props: {
      postsPagination: {
        results: posts,
        next_page: 'link',
      },
    },
  };
};
