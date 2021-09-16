/* eslint-disable react/no-array-index-key */
/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
import { GetStaticPaths, GetStaticProps } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const { isFallback } = useRouter();

  const { data, first_publication_date } = post;

  const totalWords = post.data.content.reduce((accumulator, content) => {
    accumulator += content.heading.split(' ').length;
    const words = content.body.map(item => item.text.split(' ').length);
    words.map(word => (accumulator += word));
    return accumulator;
  }, 0);
  const readTime = Math.ceil(totalWords / 200);
  return (
    <>
      {isFallback ? (
        <div>Carregando...</div>
      ) : (
        <>
          <Image
            src={data.banner.url}
            alt="banner"
            width="100%"
            height="100%"
          />
          <div>
            <h1>{data.title}</h1>
            <div>
              {format(new Date(first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
              <span>{data.author}</span>
              <span>{readTime} min</span>
            </div>
            <div>
              {data.content.map((content, contentIndex) => (
                <div key={contentIndex}>
                  <h2>{content.heading}</h2>
                  {content.body.map((paragraph, paragraphIndex) => (
                    <p key={paragraphIndex}>{paragraph.text}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // const prismic = getPrismicClient();
  // const posts = await prismic.query(TODO);

  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async context => {
  // const prismic = getPrismicClient();
  // const response = await prismic.getByUID(TODO);

  return {
    props: {},
  };
};
