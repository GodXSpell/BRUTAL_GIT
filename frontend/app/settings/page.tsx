import React from "react";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <main className="max-w-[1440px] mx-auto px-gutter py-xl">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {/*  Sidebar  */}
        <aside className="md:col-span-3">
          <div className="border-2 border-outline bg-surface rounded-none shadow-[4px_4px_0px_0px_theme(colors.outline)] flex flex-col">
            <div className="p-sm border-b-2 border-outline bg-surface-container-high">
              <h2 className="font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider">
                Personal Settings
              </h2>
            </div>
            <nav className="flex flex-col">
              <a
                className="p-sm border-b-2 border-outline font-label-sm text-label-sm uppercase bg-primary text-on-primary border-l-4 border-l-on-background hover:translate-x-[2px] transition-none flex items-center gap-3"
                href="#"
              >
                <span
                  className="material-symbols-outlined"
                  data-weight="fill"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  person
                </span>
                Public Profile
              </a>
              <a
                className="p-sm border-b-2 border-outline font-label-sm text-label-sm uppercase text-on-background hover:bg-surface-variant hover:translate-x-[2px] transition-none flex items-center gap-3"
                href="#"
              >
                <span className="material-symbols-outlined">settings</span>
                Account
              </a>
              <a
                className="p-sm border-b-2 border-outline font-label-sm text-label-sm uppercase text-on-background hover:bg-surface-variant hover:translate-x-[2px] transition-none flex items-center gap-3"
                href="#"
              >
                <span className="material-symbols-outlined">palette</span>
                Appearance
              </a>
              <a
                className="p-sm font-label-sm text-label-sm uppercase text-on-background hover:bg-surface-variant hover:translate-x-[2px] transition-none flex items-center gap-3"
                href="#"
              >
                <span className="material-symbols-outlined">notifications</span>
                Notifications
              </a>
            </nav>
          </div>
        </aside>
        {/*  Main Content Area  */}
        <section className="md:col-span-9">
          <div className="mb-lg border-b-2 border-outline pb-sm flex items-center justify-between">
            <h1 className="font-headline-lg text-headline-lg text-on-background">
              Public Profile
            </h1>
            <span className="bg-tertiary-container text-on-tertiary border-2 border-on-background px-3 py-1 font-label-sm text-label-sm uppercase rounded-none shadow-[2px_2px_0px_0px_theme(colors.on-background)]">
              Publicly Visible
            </span>
          </div>
          <div className="border-2 border-outline bg-surface p-lg rounded-none shadow-[8px_8px_0px_0px_theme(colors.outline)] mb-lg relative">
            {/*  Decorative Corner Accent  */}
            <div className="absolute top-0 right-0 w-4 h-4 border-b-2 border-l-2 border-outline bg-secondary"></div>
            <form className="space-y-md">
              {/*  Profile Picture Section  */}
              <div className="flex flex-col md:flex-row gap-lg items-start pb-md border-b-2 border-outline border-dashed">
                <div className="w-32 h-32 border-2 border-on-background rounded-none shadow-[4px_4px_0px_0px_theme(colors.on-background)] overflow-hidden shrink-0 bg-surface-container-lowest">
                  <img
                    alt="Current profile picture"
                    className="w-full h-full object-cover"
                    data-alt="close up portrait of a young man with a serious expression in harsh studio lighting"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdxqajfLGd9r7k9LM7rjRhngcAsR3sEiYOMUX6W-MOdmm5V66W5JPXEPCqLWlMMWzu-TRgweqv9j6TLcBYh57bYzdwdlqpZBgIxDGo7kfrdcZ0rHzAG-qxh3qkXWqv_HU0Y06qjpFRjZhg7-kPi4jcStiseM9TlB3jV1im5N2pnnKQNkboKNpKpgFnAPJQSLjWQa-p-obdPaTh3hjrfqPJbG1mWxgaehypDcxgwsivAQ4JbNPvVQiiqukwRAGK3Zh5zc3-772F7kE"
                  />
                </div>
                <div className="flex-1 space-y-sm">
                  <div>
                    <h3 className="font-label-sm text-label-sm uppercase text-on-background mb-1">
                      Profile Picture
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant text-sm">
                      Upload a new avatar. Square images recommended. Max size
                      2MB.
                    </p>
                  </div>
                  <div className="flex gap-sm">
                    <button
                      className="bg-secondary text-on-secondary border-2 border-on-background px-4 py-2 font-label-sm text-label-sm uppercase rounded-none shadow-[3px_3px_0px_0px_theme(colors.on-background)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_theme(colors.on-background)] transition-none active:translate-x-[3px] active:translate-y-[3px] active:shadow-none flex items-center gap-2"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-sm">
                        upload
                      </span>
                      Upload new
                    </button>
                    <button
                      className="bg-surface text-error border-2 border-error px-4 py-2 font-label-sm text-label-sm uppercase rounded-none hover:bg-error-container hover:text-on-error-container transition-none flex items-center gap-2"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-sm">
                        delete
                      </span>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
              {/*  Text Inputs  */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label
                    className="block font-label-sm text-label-sm uppercase text-on-background"
                    htmlFor="name"
                  >
                    Name
                  </label>
                  <input
                    className="w-full bg-surface-container-lowest border-2 border-outline p-sm font-body-md text-body-md text-on-background focus:outline-none focus:border-primary focus:border-[3px] rounded-none shadow-[2px_2px_0px_0px_theme(colors.outline)]"
                    id="name"
                    type="text"
                    value="Jane Doe"
                  />
                  <p className="font-body-md text-[12px] text-on-surface-variant">
                    Your real name, so people can recognize you.
                  </p>
                </div>
                <div className="space-y-xs">
                  <label
                    className="block font-label-sm text-label-sm uppercase text-on-background"
                    htmlFor="email"
                  >
                    Public Email
                  </label>
                  <input
                    className="w-full bg-surface-container-lowest border-2 border-outline p-sm font-body-md text-body-md text-on-background focus:outline-none focus:border-primary focus:border-[3px] rounded-none shadow-[2px_2px_0px_0px_theme(colors.outline)]"
                    id="email"
                    type="email"
                    value="jane.doe@example.com"
                  />
                </div>
              </div>
              <div className="space-y-xs">
                <label
                  className="block font-label-sm text-label-sm uppercase text-on-background"
                  htmlFor="bio"
                >
                  Bio
                </label>
                <textarea
                  className="w-full bg-surface-container-lowest border-2 border-outline p-sm font-body-md text-body-md text-on-background focus:outline-none focus:border-primary focus:border-[3px] rounded-none shadow-[2px_2px_0px_0px_theme(colors.outline)] resize-y"
                  id="bio"
                  rows={4}
                >
                  Full-stack developer focused on brutalist UI and
                  high-performance rust backends.
                </textarea>
                <p className="font-body-md text-[12px] text-on-surface-variant">
                  Tell us a little bit about yourself.
                </p>
              </div>
              <div className="space-y-xs">
                <label
                  className="block font-label-sm text-label-sm uppercase text-on-background"
                  htmlFor="url"
                >
                  URL
                </label>
                <div className="flex">
                  <span className="bg-surface-variant border-2 border-r-0 border-outline p-sm font-body-md text-body-md text-on-surface-variant flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm">
                      link
                    </span>
                  </span>
                  <input
                    className="flex-1 bg-surface-container-lowest border-2 border-outline p-sm font-body-md text-body-md text-on-background focus:outline-none focus:border-primary focus:border-[3px] rounded-none shadow-[2px_2px_0px_0px_theme(colors.outline)]"
                    id="url"
                    type="url"
                    value="https://janedoe.dev"
                  />
                </div>
              </div>
              <div className="space-y-xs">
                <label
                  className="block font-label-sm text-label-sm uppercase text-on-background"
                  htmlFor="company"
                >
                  Company
                </label>
                <input
                  className="w-full bg-surface-container-lowest border-2 border-outline p-sm font-body-md text-body-md text-on-background focus:outline-none focus:border-primary focus:border-[3px] rounded-none shadow-[2px_2px_0px_0px_theme(colors.outline)]"
                  id="company"
                  type="text"
                  value="@brutal_git_inc"
                />
              </div>
              <div className="pt-md border-t-2 border-outline mt-md flex justify-end">
                <button
                  className="bg-primary text-on-primary border-2 border-on-background px-6 py-3 font-label-sm text-label-sm uppercase rounded-none shadow-[4px_4px_0px_0px_theme(colors.on-background)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_theme(colors.on-background)] transition-none active:translate-x-[4px] active:translate-y-[4px] active:shadow-none flex items-center gap-2"
                  type="submit"
                >
                  <span className="material-symbols-outlined text-sm">
                    save
                  </span>
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
