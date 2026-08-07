import { ArrowRight, BookOpenText, CalendarDays, ShoppingBasket, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '@/assets/hero-roast-chicken.png';
import breakfastImage from '@/assets/recipe-breakfast.png';
import lunchImage from '@/assets/recipe-lunch.png';
import dinnerImage from '@/assets/recipe-dinner.png';

const STEPS = [
  { number: '01', icon: BookOpenText, title: 'Find your next favorite', body: 'A deep, organized collection that makes a good idea easy to follow.' },
  { number: '02', icon: CalendarDays, title: 'Make the week feel lighter', body: 'Put meals on the table before the day gets away from you.' },
  { number: '03', icon: ShoppingBasket, title: 'Shop with purpose', body: 'One grocery list that understands what the whole week needs.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fbfbfa] text-[#171817]">
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 md:px-10">
          <Link to="/" className="flex items-center gap-2 text-[#171817]" aria-label="Cookbook home">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white shadow-[0_5px_14px_rgba(189,41,36,0.18)]"><BookOpenText size={19} /></span>
            <span className="font-display text-[25px] leading-none">Cookbook.</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-[#4f534e] md:flex" aria-label="Home navigation">
            <a href="#the-table" className="transition-colors hover:text-primary">The table</a>
            <a href="#how-it-works" className="transition-colors hover:text-primary">How it works</a>
            <a href="#your-kitchen" className="transition-colors hover:text-primary">Your kitchen</a>
          </nav>
          <Link to="/kitchen" className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(189,41,36,0.18)] transition-colors hover:bg-primary-hover">
            Enter cookbook <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <main>
        <section
          className="relative flex min-h-[calc(100svh-96px)] items-center overflow-hidden bg-[#e9e6df] bg-cover bg-right bg-no-repeat pt-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="mx-auto w-full max-w-[1440px] px-5 py-16 md:px-10 md:py-20">
            <div className="max-w-[570px]">
              <p className="text-sm font-semibold text-primary">A more beautiful way to cook at home</p>
              <h1 className="mt-4 font-display text-[68px] leading-[0.88] text-[#171817] sm:text-[92px]">Cookbook.</h1>
              <p className="mt-5 max-w-[470px] font-display text-[34px] leading-[1.08] text-[#171817] sm:text-[42px]">Your whole kitchen, in one good place.</p>
              <p className="mt-5 max-w-[390px] text-base leading-7 text-[#5e625d]">Recipes worth returning to. A plan that holds together. Groceries that already know the way.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/kitchen" className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(189,41,36,0.2)] transition-colors hover:bg-primary-hover">Build my kitchen <ArrowRight size={17} /></Link>
                <a href="#the-table" className="inline-flex h-12 items-center gap-2 rounded-lg border border-[#cfcfc9] bg-white/80 px-5 text-sm font-semibold text-[#171817] transition-colors hover:border-[#171817]/30 hover:bg-white">See what&apos;s inside</a>
              </div>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 border-t border-[#171817]/10 bg-white/85 backdrop-blur-sm">
            <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-5 py-4 text-sm text-[#4f534e] md:px-10"><Sparkles size={16} className="text-primary" /><span><strong className="font-semibold text-[#171817]">2,237 recipes</strong> for every appetite, every skill level, and every Tuesday night.</span></div>
          </div>
        </section>

        <section id="the-table" className="border-b border-[#e4e3de] bg-white pb-20 pt-12 md:pb-28 md:pt-16">
          <div className="mx-auto max-w-[1440px] px-5 md:px-10">
            <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
              <div>
                <p className="text-sm font-semibold text-primary">Not another recipe tab</p>
                <h2 className="mt-3 font-display text-[44px] leading-[1.02] text-[#171817] sm:text-[58px]">The place your cooking life comes together.</h2>
              </div>
              <p className="max-w-xl text-base leading-7 text-[#5e625d]">Cookbook gives a brand-new cook a clear next step and gives an experienced one more room to play. It holds the recipe, the plan, the ingredients, and the little details that make dinner feel possible.</p>
            </div>

            <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
              <figure className="group">
                <img src={breakfastImage} alt="Berry pancakes for breakfast" className="aspect-[4/5] w-full object-cover" />
                <figcaption className="mt-4 flex items-baseline justify-between gap-3"><span className="font-display text-2xl text-[#171817]">Start simply</span><span className="text-sm font-semibold text-primary">Breakfast</span></figcaption>
              </figure>
              <figure className="group md:translate-y-10">
                <img src={lunchImage} alt="Mediterranean grain bowl for lunch" className="aspect-[4/5] w-full object-cover" />
                <figcaption className="mt-4 flex items-baseline justify-between gap-3"><span className="font-display text-2xl text-[#171817]">Make it yours</span><span className="text-sm font-semibold text-primary">Lunch</span></figcaption>
              </figure>
              <figure className="group">
                <img src={dinnerImage} alt="Tomato basil pasta for dinner" className="aspect-[4/5] w-full object-cover" />
                <figcaption className="mt-4 flex items-baseline justify-between gap-3"><span className="font-display text-2xl text-[#171817]">Stay for dinner</span><span className="text-sm font-semibold text-primary">Dinner</span></figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="bg-[#1a1d1a] py-20 text-white md:py-28">
          <div className="mx-auto max-w-[1440px] px-5 md:px-10">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-[#f18880]">A calm rhythm for the week</p>
              <h2 className="mt-3 font-display text-[44px] leading-[1.02] sm:text-[58px]">Good cooking gets easier when everything has a place.</h2>
            </div>
            <div className="mt-14 grid divide-y divide-white/15 border-y border-white/15 md:grid-cols-3 md:divide-x md:divide-y-0">
              {STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.number} className="py-7 md:px-8 md:py-2 first:md:pl-0 last:md:pr-0">
                    <span className="text-xs font-semibold text-[#f18880]">{step.number}</span>
                    <span className="mt-8 flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-[#f18880]"><Icon size={19} /></span>
                    <h3 className="mt-6 font-display text-3xl">{step.title}</h3>
                    <p className="mt-3 max-w-xs text-sm leading-6 text-white/65">{step.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="your-kitchen" className="bg-[#f3f4f1] py-20 md:py-28">
          <div className="mx-auto grid max-w-[1440px] gap-10 px-5 lg:grid-cols-[1fr_auto] lg:items-end md:px-10">
            <div>
              <p className="text-sm font-semibold text-primary">Your kitchen, your rules</p>
              <h2 className="mt-3 max-w-3xl font-display text-[46px] leading-[1.02] text-[#171817] sm:text-[64px]">From allergies to ambitious dinner plans, it starts where you are.</h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#5e625d]">Set your preferences, save what you love, and make the cookbook feel more personal every time you return.</p>
            </div>
            <Link to="/kitchen" className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(189,41,36,0.2)] transition-colors hover:bg-primary-hover">Enter my kitchen <ArrowRight size={17} /></Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e4e3de] bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-5 py-7 text-sm text-[#6d706b] sm:flex-row sm:items-center sm:justify-between md:px-10">
          <span className="font-display text-xl text-[#171817]">Cookbook.</span>
          <Link to="/kitchen" className="font-semibold text-[#171817] hover:text-primary">Open my cookbook</Link>
        </div>
      </footer>
    </div>
  );
}
