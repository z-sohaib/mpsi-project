export default function SignIn() {
  return (
    <div className='w-full max-w-md rounded-2xl border-2 border-blue-500 bg-white p-6 shadow-lg'>
      <h2 className='mb-2 text-xl'>
        <span className='text-gray-900'>Bienvenue à la plateforme</span>
        <span className='text-blue-500'> de maintenance de ESI</span>
      </h2>
      <h3 className='mb-6 text-3xl font-bold'>Sign in</h3>
      <p className='mb-4 text-gray-600'>Use your google@esi.dz account</p>
      <button className='mb-4 flex w-full items-center justify-center rounded-lg border-none bg-transparent p-0 py-2'>
        <img
          src='/google.png'
          alt='Sign in with Google'
          className='h-10 w-auto object-contain transition-transform hover:scale-105 hover:shadow-lg'
        />
      </button>

      <div className='my-4 text-center text-gray-400'>or</div>
      <form className='space-y-4'>
        <div>
          <label
            htmlFor='username'
            className='mb-2 block text-lg font-semibold'
          >
            Enter your username or email address
          </label>
          <input
            id='username'
            type='text'
            placeholder='Username or email address'
            className='w-full rounded-lg border border-gray-200 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>
        <div>
          <label
            htmlFor='password'
            className='mb-2 block text-lg font-semibold'
          >
            Enter your Password
          </label>
          <input
            id='password'
            type='password'
            placeholder='Password'
            className='w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>
        <button
          type='button'
          onClick={() => alert('Redirect to password recovery')} // Replace with actual navigation
          className='block text-right text-sm text-blue-500 hover:underline'
        >
          Forgot Password?
        </button>
        <button
          type='submit'
          className='w-full rounded-lg bg-blue-500 py-2 text-white shadow-md transition-all hover:bg-blue-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
