import Link from 'next/link'
import Date from '@/components/Date'

import {getSortedPostsData} from '@/lib/posts'
import Image from "next/image";

type AllPostsData = {
  date: string
  title: string
  id: string
}[]

// Change this url to change the image!
const imageUrl = '/images/snorlax.jpg';

export default function Home() {
  const allPostsData: AllPostsData = getSortedPostsData()

  return (
      <div>
        <section>
          <p className={'prose'}>
            Hey I&apos;m Rania. This is my site.
          </p>
          <div className={'my-4'}>
            <i>
              Check out the repo{' '}
                <Link href={'https://github.com/ludu12/tech-journey-blog'}>
                  <button className={'btn btn-sm btn-primary'}>
                      <span className={'text-primary-content'}>
                        here
                      </span>
                  </button>
                </Link>
            </i>
          </div>
        </section>

        <div className={'my-4'}>
          <Image className={'rounded'} src={imageUrl} alt={'My Image'} width={500}
                 height={500}/>
        </div>

        <section className={'prose my-8'}>
          <h2>Play checkers</h2>
          <p>
            I turned the site into a small game hub with a checkers board you can play against a simple AI or with a friend.
          </p>
          <Link href={'/checkers'}>
            <button className={'btn btn-primary'}>Open checkers</button>
          </Link>
        </section>

        <section className={'prose'}>
          <h2>Blog</h2>
          <ul>
            {allPostsData.map(({id, date, title}) => (
                <li key={id}>
                  <div>
                    <Link href={`/posts/${id}`}>{title}</Link>
                    <br/>
                    <small>
                      <Date dateString={date}/>
                    </small>
                  </div>
                </li>
            ))}
          </ul>
        </section>
      </div>
  )
}
