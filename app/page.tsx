import TrendingCourses from '@/components/trending-courses'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getTopCreators } from '@/lib/entities/creators'
import { combineName } from '@/lib/entities/users'
import Link from 'next/link'

export default async function Home() {
  const topCreators = await getTopCreators()

  return (
    <section className="pb-24 pt-40">
      <div className="container">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Trending courses</h1>

            <TrendingCourses />
          </div>

          <div className="flex flex-col gap-6 sm:flex-row lg:flex-col">
            <Card className="w-full lg:w-[350px]">
              <CardHeader>
                <CardTitle>Top Creators</CardTitle>
                <CardDescription>Top creators this month.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul role="list" className="flex flex-col">
                  {topCreators.map((creator) => (
                    <li
                      key={creator.id}
                      className="relative rounded-md px-4 py-2.5 hover:bg-muted/50"
                    >
                      <div className="flex w-full min-w-0 items-center justify-between gap-x-4">
                        <img
                          alt=""
                          src={creator.imageUrl || ''}
                          className="size-14 flex-none rounded-full bg-gray-50 object-cover"
                        />
                        <div className="min-w-0 flex-auto">
                          <p className="text-sm font-semibold">
                            <Link href={`/creators/${creator.clerkUserId}`}>
                              <span className="absolute inset-0" />
                              {combineName(creator)}
                            </Link>
                          </p>
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                            {creator.bio}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter></CardFooter>
            </Card>

            <Card className="w-full lg:w-[350px]">
              <CardHeader>
                <CardTitle>Recent Blogs</CardTitle>
                <CardDescription>Recent blogs this month.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul role="list" className="flex flex-col">
                  <li className="relative rounded-md px-4 py-2.5 hover:bg-muted/50">
                    <div className="flex w-full min-w-0 items-center justify-between gap-x-4">
                      <div className="min-w-0 flex-auto">
                        <p className="text-sm font-semibold">
                          <Link href="/blog/1">
                            <span className="absolute inset-0" />
                            How to create a blog post
                          </Link>
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          Learn how to create a blog post using Next.js.
                        </p>
                      </div>
                    </div>
                  </li>
                  <li className="relative rounded px-3 py-2 hover:bg-muted/50">
                    <div className="flex w-full min-w-0 items-center justify-between gap-x-4">
                      <div className="min-w-0 flex-auto">
                        <p className="text-sm font-semibold">
                          <Link href="/blog/2">
                            <span className="absolute inset-0" />
                            How to create a course
                          </Link>
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          Learn how to create a course using Next.js.
                        </p>
                      </div>
                    </div>
                  </li>
                </ul>
              </CardContent>
              <CardFooter></CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
