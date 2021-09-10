import React, { useState } from 'react';
import cx from 'classnames';
import { v4 as uuid } from 'uuid';
import { Edition, OrderItem } from '../types';
import { XCircleIcon } from '@heroicons/react/solid';

interface Props {
  editions: Edition[];
  onCancel: () => unknown;
  onSelect: (item: OrderItem) => unknown;
}

const SelectBook: React.FC<Props> = ({ editions, onCancel, onSelect }) => {
  const [filterText, setFilterText] = useState(``);

  const filteredEditions = editions.filter((edition) => {
    if (filterText.length < 4) {
      return false;
    }
    const searchTerms = filterText.trim().toLowerCase().split(/\s+/g);
    for (const term of searchTerms) {
      if (!edition.searchString.includes(term)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div>
      <button className="absolute left-4 top-4" onClick={onCancel}>
        <XCircleIcon className="h-10 w-10 text-flprimary ring-flprimary hover:ring-2 rounded-full" />
      </button>
      <h1 className="text-flprimary font-sans font-bold text-2xl antialiased">
        Select a Book
      </h1>
      <div className="flex justify-between mt-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Enter text to select a book:
        </label>
      </div>
      <div className="mt-1">
        <input
          type="text"
          className="shadow-sm focus:ring-flprimary-500 focus:border-flprimary-500 block w-full sm:text-sm border-gray-300 rounded-md placeholder-gray-300"
          placeholder="e.g: No Cross No Crown, Hugh Turford, La Senda Antigua ..."
          value={filterText}
          onChange={(event) => setFilterText(event.target.value)}
        />
      </div>
      <div className="mt-3">
        <p className="font-mono text-gray-400 antialiased text-xs mb-2 ml-1">
          {filteredEditions.length} results
        </p>
        {filteredEditions.map((edition) => (
          <div key={edition.id} className="bg-[#efefef] rounded-md mb-3 py-1.5 flex pr-2">
            <img
              className="h-[161px] w-auto"
              alt={edition.document.trimmedUtf8ShortTitle}
              src={edition.image.large}
            />
            <div className="ml-2 space-y-1.5 mt-4">
              <h1 className="font-sans font-bold text-xl text-flprimary">
                {edition.document.trimmedUtf8ShortTitle}
              </h1>
              <h2 className="font-serif text-md antialiased text-gray-800">
                {edition.friend.name}
              </h2>
              <h3 className="font-serif text-md">
                <span
                  className={cx(`capitalize`, {
                    'text-flmaroon': edition.type === `updated` && edition.lang === `en`,
                    'text-flgold': edition.type === `updated` && edition.lang === `es`,
                    'text-flblue': edition.type === `modernized`,
                    'text-flgreen': edition.type === `original`,
                  })}
                >
                  {edition.type}
                </span>
                {` `}
                edition
              </h3>
            </div>
            <button
              onClick={() => {
                onSelect({
                  id: uuid(),
                  editionId: edition.id,
                  image: edition.image.small,
                  orderTitle: `${edition.document.title}${
                    edition.type !== `updated` ? ` (${edition.type})` : ``
                  }`,
                  displayTitle: edition.document.trimmedUtf8ShortTitle,
                  author: edition.friend.name,
                  documentId: edition.document.id,
                  quantity: 1,
                  unitPrice: edition.price,
                  editionType: edition.type,
                  printSize: edition.printSize,
                  pages: edition.pages,
                });
              }}
              className="ml-auto whitespace-no-wrap flex-shrink-0 bg-flblue-600 hover:ring-2 ring-offset-2 ring-flblue-400 cursor-pointer mr-2 antialiased uppercase text-xs self-end mb-4 rounded-full text-white px-4 py-1"
            >
              Add to Order +
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectBook;
