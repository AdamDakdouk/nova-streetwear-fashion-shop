# AI Development Methodology

## How I Used AI

I used AI-assisted development throughout this project (Claude), not just for one-off snippets here and there. Before I touched any AI tool, I worked out the project idea myself: the features, the assessment requirements, the project structure, and the tech stack. Once I had that clear in my head, I fed it to the AI tool as context and used it to help generate and implement the actual application on top of that plan.

If you look at the git log, you'll see `Co-Authored-By` trailers on a lot of the commits,I wanted that to be visible rather than something you'd have to take my word for.

## How I Actually Worked

My day-to-day loop looked roughly like this:

1st I figure out what the feature needs to do, then I explain the behavior, architecture and the tech to the AI tool. Then, the AI generates the code, I read it, run the app and test all features, and if something broke or looked off, I dig into why. Then I either fix it myslef or ask the Ai to adjust it. I then re-run tests and check things by hand before moving on

So AI was in the loop the whole way through, but nothing shipped without me actually running it and looking at what came out the other end.

## Where I Had to Step In

AI got me a working first draft fast, but a handful of real bugs only showed up once the app was actually deployed and in front of real devices. For example:

The homepage hero banner was missing on the live site. I caught this on the actual deployment, not in local dev, and the root cause was Vercel treating a catch-all route as if it only matched a single path segment, so any two-level API route (like /api/site-content/hero) was getting 404 in production even though it worked fine locally.

Also, a friend testing on an iPhone I don't own caught something I never would have seen myself alone.The issue was that tapping any input field forced Safari to zoom the whole page in. That's an iOS quirk where any input under 16px font size triggers auto-zoom on focus, so I went through and made sure every input stays at 16px on small screens.
Another issue is that the search was returning nothing for totally normal terms like "hat" or "belts.".The AI-written search logic matched against exact titles and categories, but that's not how people actually search, so I reworked it to search across titles, categories, slugs, and variant values

## What I Was Responsible For

I owned the requirements, the technical direction, and every decision about the architecture. AI helped write code, but I decided what got built and why. Nothing generated got treated as correct by default, I read it, ran it, and tested it before I called a feature done.

## Testing

Once something was implemented, I used the app myself and ran the automated tests to check the main flows actually worked. Whenever something went wrong, I used the error output and what I knew about the project to track down the cause, then re-ran the app or the tests to confirm the fix actually held.
