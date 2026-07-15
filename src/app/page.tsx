import Link from 'next/link'
import Date from '@/components/Date'
import HomeCheckersPreview from '@/components/HomeCheckersPreview'

import {getSortedPostsData} from '@/lib/posts'
import Image from "next/image";

type AllPostsData = {
  date: string
  title: string
  id: string
}[]

// Change this URL to swap the main image.
const imageUrl = '/images/mountain.jpg';

export default function Home() {
  const allPostsData: AllPostsData = getSortedPostsData()

  return (
      <div className={'space-y-8'}>
        <section className={'rounded-[2rem] border border-stone-300 bg-stone-50 p-6 shadow-md'}>
          <div className={'grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center'}>
            <div className={'prose prose-slate max-w-none'}>
              <p className={'mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-stone-600'}>
                Welcome
              </p>
              <h1 className={'text-4xl font-semibold text-stone-900'}>
                Checkers made simple.
              </h1>
              <p className={'text-lg leading-8 text-stone-700'}>
                Play a quick match against the AI or challenge a friend in two-player mode.
              </p>
            </div>

            <div className={'overflow-hidden rounded-[1.5rem] border border-stone-300 bg-white p-3 shadow-sm'}>
              <Image className={'h-full w-full rounded-[1.1rem] object-cover'} src={imageUrl} alt={'Featured homepage image'} width={700} height={500} />
            </div>
          </div>
        </section>

        <HomeCheckersPreview />

        <section className={'rounded-[1.5rem] border border-slate-200 bg-white/80 p-6 shadow-md'}>
          <h2 className={'text-2xl font-semibold text-slate-900'}>Recent posts</h2>
          <ul className={'mt-3 space-y-3'}>
            {allPostsData.map(({id, date, title}) => (
                <li key={id}>
                  <div>
                    <Link className={'font-medium text-indigo-700 hover:text-indigo-900'} href={`/posts/${id}`}>{title}</Link>
                    <br/>
                    <small className={'text-slate-500'}>
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
