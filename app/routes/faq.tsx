import { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import { Button } from '~/components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { faqData } from '~/constants/faq';

export default function FAQPage() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const toggleFAQ = (index: number) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    index: number,
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleFAQ(index);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(faqData.length / itemsPerPage);
  const paginatedFAQs = faqData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <Layout>
      <div className='mx-auto my-8 max-w-4xl px-4 md:px-0'>
        <div className='relative min-h-screen overflow-hidden bg-white font-sans'>
          {/* Fond bleu supérieur */}
          <div className='absolute left-0 top-0 z-0 h-[48%] w-full bg-[#007bff]' />

          {/* Illustration homme - agrandie et décalée à droite */}
          <img
            src='/kahina/illus.png'
            alt='Illustration'
            className='absolute bottom-0 left-10 z-0 h-72 w-[500px] md:w-[540px]'
          />

          {/* Courbe - en bas à droite derrière le contenu */}
          <img
            src='/kahina/curve.png'
            alt='curve'
            className='absolute -right-8 bottom-0 z-0 h-64 w-40'
          />

          {/* Contenu de bienvenue en haut à gauche */}
          <div className='absolute left-7 top-4 z-10 max-w-md text-white'>
            <img src='/kahina/esi.png' alt='Logo ESI' className='mb-4 w-20' />
            <h1 className='mb-2 text-3xl font-bold'>
              Bienvenue à l&apos;ESI Alger
            </h1>
            <p className='w-96 text-sm font-thin leading-relaxed'>
              Découvrez les réponses aux questions fréquentes sur notre
              institution.
            </p>
          </div>

          {/* Contenu FAQ */}
          <div className='relative z-10 flex min-h-screen items-center justify-end pr-6'>
            <div className='relative w-full max-w-3xl rounded-2xl bg-white p-4 shadow-2xl'>
              <h2 className='mb-8 text-center text-3xl font-bold text-[#007bff]'>
                Questions Fréquentes
              </h2>
              {paginatedFAQs.map((faq, index) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + index;
                return (
                  <motion.div
                    key={globalIndex}
                    className='mb-4 border-b border-gray-200 py-4'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div
                      className='flex cursor-pointer items-center justify-between'
                      onClick={() => toggleFAQ(globalIndex)}
                      onKeyDown={(e) => handleKeyDown(e, globalIndex)}
                      tabIndex={0}
                      role='button'
                      aria-expanded={activeIndex === globalIndex}
                    >
                      <h3 className='text-lg font-medium text-gray-900'>
                        {faq.question}
                      </h3>
                      <svg
                        className={`size-6 transition-transform duration-300${
                          activeIndex === globalIndex ? 'rotate-180' : ''
                        }`}
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M19 9l-7 7-7-7'
                        />
                      </svg>
                    </div>
                    {activeIndex === globalIndex && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                        className='mt-4 text-gray-700'
                      >
                        {faq.answer}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
              {/* Pagination Controls */}
              <div className='mt-6 flex justify-between'>
                <Button
                  variant='outline'
                  className='flex items-center gap-2 border-[#007bff] text-[#007bff]'
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className='size-4' /> Précédent
                </Button>
                <Button
                  variant='outline'
                  className='flex items-center gap-2 border-[#007bff] text-[#007bff]'
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Suivant <ChevronRight className='size-4' />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
