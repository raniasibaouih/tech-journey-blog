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
        <section className={'rounded-[2rem] border border-amber-200/70 bg-gradient-to-br from-amber-100 via-rose-100 to-indigo-100 p-6 shadow-xl'}>
          <div className={'grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center'}>
            <div className={'prose prose-slate max-w-none'}>
              <p className={'mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-indigo-700'}>
                Welcome
              </p>
              <h1 className={'text-4xl font-semibold text-slate-900'}>
                A bright little corner for play and ideas.
              </h1>
              <p className={'text-lg leading-8 text-slate-700'}>
                Play checkers, jump into a simple AI match, or invite a friend for a local two-player game.
              </p>
              <div className={'mt-4'}>
                <Link href={'/checkers'}>
                  <button className={'btn btn-primary'}>Play checkers</button>
                </Link>
              </div>
            </div>

            <div className={'overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/70 p-3 shadow-lg'}>
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
