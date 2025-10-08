// src/components/Loader.tsx
export default function Loader() {
  return (
    <section className='flex items-center justify-center h-screen bg-[var(--brand-100)]'>
      <div className='w-40 h-40 bg-white rounded-full flex items-center justify-center animate-ping'>
        <img
          src='/src/assets/images/qylon-logo.png'
          alt='Qylon Logo'
          className='w-full h-full object-contain'
        />
      </div>
    </section>
  );
}
