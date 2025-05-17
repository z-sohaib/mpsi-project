import { motion } from 'framer-motion';

export default function NotFoundPage() {
  return (
    <div className='flex min-h-screen w-full items-center justify-center bg-gradient-to-tr from-blue-400 to-blue-600 p-2 sm:p-4'>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className='flex h-[76vh] w-4/5 flex-col items-center overflow-hidden rounded-3xl bg-white p-6 shadow-2xl sm:p-10 md:flex-row md:p-16'
      >
        {/* Left Side */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className='mb-10 w-full text-center md:mb-0 md:w-1/2 md:text-left'
        >
          <h1 className='mb-6 text-5xl font-extrabold leading-tight text-blue-600 sm:text-6xl lg:text-7xl'>
            Page
            <br />
            Not Found
          </h1>
          <p className='mx-auto mb-10 max-w-md text-base text-gray-500 sm:text-lg md:mx-0'>
            La page que vous recherchez n’existe pas ou a été déplacée. Veuillez
            vérifier l’URL ou revenir à la page précédente.
          </p>
          <button
            onClick={() => window.history.back()}
            className='rounded-lg bg-blue-600 px-10 py-3 text-lg font-semibold text-white shadow-sm transition-shadow hover:bg-blue-700 hover:shadow-lg sm:px-14 sm:py-4 sm:text-xl'
          >
            Back
          </button>
        </motion.div>

        {/* Right Side */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className='flex w-full items-center justify-center md:w-1/2'
        >
          <img
            src='/error.png'
            alt='404 Error Illustration'
            className='w-full max-w-sm sm:max-w-md lg:max-w-lg'
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
