import { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import { Button } from '~/components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const faqData = [
  {
    question: "Qu'est-ce que l'ESI Alger ?",
    answer:
      "L'École Nationale Supérieure d'Informatique (ESI) Alger est une institution d'enseignement supérieur spécialisée dans l'informatique et les technologies de l'information. Elle forme des ingénieurs et des chercheurs dans divers domaines de l'informatique.",
  },
  {
    question: "Qu'est-ce que la plateforme de maintenance de l'ESI ?",
    answer:
      "La plateforme de maintenance de l'ESI est une application web permettant de signaler, suivre et gérer les demandes de maintenance au sein de l'école. Elle est destinée aux étudiants, enseignants et personnel administratif.",
  },
  {
    question: 'Comment signaler un problème via la plateforme ?',
    answer:
      "Pour signaler un problème, connectez-vous à la plateforme avec vos identifiants ESI, puis remplissez un formulaire décrivant la nature du problème, sa localisation et toute information utile. Une fois soumis, votre demande sera prise en charge par l'équipe technique.",
  },
  {
    question: 'Qui peut accéder à la plateforme de maintenance ?',
    answer:
      "La plateforme est accessible à tous les membres de la communauté ESI : étudiants, enseignants et personnel. Chaque utilisateur peut consulter l'état d'avancement de ses demandes.",
  },
  {
    question: "Comment suivre l'état de ma demande de maintenance ?",
    answer:
      "Après avoir soumis une demande, vous pouvez suivre son évolution via votre tableau de bord personnel. Vous serez également notifié lorsque l'intervention est programmée ou réalisée.",
  },
  {
    question: "À qui s'adresser en cas de problème avec la plateforme ?",
    answer:
      "En cas de dysfonctionnement de la plateforme ou de difficulté à l'utiliser, vous pouvez contacter le service informatique de l'ESI via l'adresse e-mail support@esi.dz ou directement via la section 'Assistance' de la plateforme.",
  },
];

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
