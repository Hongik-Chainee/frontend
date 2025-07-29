'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, BellIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Project', href: '/projects' },
  { name: 'Talent', href: '/matching' },
  { name: 'Profile', href: '/profile' },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Header() {
  return (
    <Disclosure as="nav" className="bg-transparent relative z-20">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Link href="/" className="flex items-center space-x-2">
                    <span className="text-white font-bold text-2xl">Chainee</span>
                  </Link>
                </div>
              </div>

              <div className="hidden sm:flex sm:items-center sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    {item.name}
                  </Link>
                ))}
              
                <button type="button" className="p-1 text-gray-300 hover:text-white">
                  <span className="sr-only">채팅 보기</span>
                  <ChatBubbleLeftIcon className="h-6 w-6" />
                </button>
                <button type="button" className="ml-4 p-1 text-gray-300 hover:text-white">
                  <span className="sr-only">알림 보기</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div className="-mr-2 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent">
                  <span className="sr-only">메뉴 열기</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
 