// import { GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
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
  console.log(postsPagination);

  return <h1>oi</h1>;
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts'),
  ]);

  const posts = postsResponse.results.map(postResponse => {
    return {
      uid: postResponse.uid,
      first_publication_date: format(
        new Date(postResponse.first_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
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
      results: posts,
      next_page: '',
    },
  };
};
