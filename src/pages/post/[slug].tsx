/* eslint-disable react/no-array-index-key */
/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Prismic from '@prismicio/client';
import { BiCalendarAlt, BiUser, BiTimeFive } from 'react-icons/bi';
import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Comments from '../../components/Comments';

interface Post {
  uid: string;
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
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
  navigation: {
    prevPost: {
      uid: string;
      data: {
        title: string;
      };
    }[];
    nextPost: {
      uid: string;
      data: {
        title: string;
      };
    }[];
  };
}

export default function Post({ post, navigation }: PostProps) {
  const { isFallback } = useRouter();

  const { data, first_publication_date, last_publication_date } = post;

  const isPostEdited = first_publication_date !== last_publication_date;

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
          <Head>
            <title>{post.data.title} | spacetraveling</title>
          </Head>
          <main>
            <img src={data.banner.url} alt="banner" className={styles.image} />
            <div className={commonStyles.content}>
              <header className={styles.postHeader}>
                <h1>{data.title}</h1>
                <div className={styles.postInfo}>
                  <span>
                    <BiCalendarAlt />
                    <time>
                      {format(new Date(first_publication_date), 'dd MMM yyyy', {
                        locale: ptBR,
                      })}
                    </time>
                  </span>
                  <span>
                    <BiUser />
                    <small>{data.author}</small>
                  </span>
                  <span>
                    <BiTimeFive />
                    <small>{readTime} min</small>
                  </span>
                </div>
                {isPostEdited && (
                  <div className={styles.info}>
                    <span>
                      <small>
                        <time>
                          {format(
                            new Date(post.last_publication_date),
                            "'* editado em' dd MMM yyyy', ??s 'HH':'mm",
                            {
                              locale: ptBR,
                            }
                          )}
                        </time>
                      </small>
                    </span>
                  </div>
                )}
              </header>

              <div className={styles.postBody}>
                {data.content.map((content, contentIndex) => (
                  <div key={contentIndex} className={styles.postBodyContent}>
                    <h2>{content.heading}</h2>
                    {/* <div
                      className={styles.text}
                      // eslint-disable-next-line react/no-danger
                      dangerouslySetInnerHTML={{
                        __html: RichText.asHtml(content.body),
                      }}
                    /> */}
                    {content.body.map((paragraph, index) => (
                      <p key={index}>{paragraph.text}</p>
                    ))}
                  </div>
                ))}
              </div>

              <section className={styles.postsNavigation}>
                {navigation.prevPost.length > 0 && (
                  <div>
                    <h3>{navigation.prevPost[0].data.title}</h3>
                    <Link href={`/post/${navigation.prevPost[0].uid}`}>
                      <a>Post anterior</a>
                    </Link>
                  </div>
                )}

                {navigation.nextPost.length > 0 && (
                  <div>
                    <h3>{navigation.nextPost[0].data.title}</h3>
                    <Link href={`/post/${navigation.nextPost[0].uid}`}>
                      <a>Pr??ximo post</a>
                    </Link>
                  </div>
                )}
              </section>
            </div>

            <Comments />
          </main>
        </>
      )}
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const { results } = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.uid'],
    }
  );

  const paths = results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { params } = context;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(params.slug), {
    orderings: '[document.last_publication_date desc]',
  });

  const prevPost = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.first_publication_date]',
    }
  );

  const nextPost = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.last_publication_date desc]',
    }
  );

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(content => ({
        heading: content.heading,
        body: [...content.body],
      })),
    },
  };

  return {
    props: {
      post,
      navigation: {
        prevPost: prevPost?.results,
        nextPost: nextPost?.results,
      },
    },
  };
};
