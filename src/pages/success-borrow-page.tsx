import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';

export const SuccessBorrowPage: React.FC = () => {
  const navigate = useNavigate();

  // Get return date from localStorage or use default
  const getReturnDate = () => {
    // You can pass this via state or localStorage from checkout page
    const today = new Date();
    today.setDate(today.getDate() + 3); // Default 3 days
    const day = today.getDate();
    const month = today.toLocaleString('en-US', { month: 'long' });
    const year = today.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const handleGoToLoans = () => {
    navigate('/profile?tab=borrowed');
  };

  return (
    <>
      <div className='min-h-screen bg-gray-50 flex flex-col p-4 md:p-8'>
        {/* Main Content */}
        <div className='flex-1 flex items-center justify-center'>
          {/* Success Container - Frame 1618873980 */}
          <motion.div
            className='flex flex-col items-center p-0 gap-6 md:gap-8 w-full max-w-[345px] md:max-w-[638px] h-auto md:h-[332.38px]'
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Success Icon */}
            <div className='relative flex flex-row items-center justify-center p-[6.34px] gap-[6.34px] w-[142.38px] h-[142.38px] border border-[#E9EAEB] rounded-[79.26px]'>
              {/* Soft ambient glow */}
              <motion.div
                className='absolute w-[180px] h-[180px] rounded-full'
                style={{ background: 'radial-gradient(circle, rgba(28,101,218,0.12) 0%, transparent 70%)' }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: [0, 1, 0.6], scale: [0.5, 1.2, 1] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                }}
              />

              {/* Rotating ring accent */}
              <motion.div
                className='absolute w-[152px] h-[152px] rounded-full'
                style={{
                  border: '1.5px dashed rgba(28,101,218,0.2)',
                }}
                initial={{ rotate: 0, opacity: 0 }}
                animate={{ rotate: 360, opacity: 1 }}
                transition={{
                  rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                  opacity: { duration: 0.8, delay: 0.4 },
                }}
              />

              {/* Inner Circle */}
              <motion.div
                className='flex flex-row items-center justify-center p-[6.34px] gap-[6.34px] w-[129.69px] h-[129.69px] border border-[#E9EAEB] rounded-[792.62px]'
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 15,
                  delay: 0.2,
                }}
              >
                {/* Check Container */}
                <motion.div
                  className='flex flex-row items-center justify-center p-0 gap-[6.34px] w-[117.01px] h-[117.01px] border border-[#E9EAEB] rounded-[79.26px]'
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 180,
                    damping: 14,
                    delay: 0.35,
                  }}
                >
                  {/* Check Icon with Blue Background */}
                  <motion.div
                    className='w-[80.64px] h-[80.64px] bg-[#1C65DA] rounded-full flex items-center justify-center'
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 260,
                      damping: 20,
                      delay: 0.5,
                    }}
                  >
                    <motion.svg
                      className='w-7 h-7 text-white'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth={3}
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <motion.path
                        d='M4 12L9 17L20 6'
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{
                          pathLength: { duration: 0.5, delay: 0.9, ease: [0.65, 0, 0.35, 1] },
                          opacity: { duration: 0.1, delay: 0.9 },
                        }}
                      />
                    </motion.svg>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>

            {/* Success Message */}
            <div className='flex flex-col items-center justify-center p-0 gap-2 w-full max-w-[345px] md:max-w-[638px] h-auto md:min-h-[78px]'>
              {/* Title — slides in from left with blur */}
              <motion.h1
                className='w-full h-[34px] md:h-auto font-bold text-xl md:text-[28px] leading-[34px] md:leading-[38px] text-center tracking-[-0.02em] text-[#0A0D12]'
                style={{ fontFamily: 'Quicksand, sans-serif' }}
                initial={{ opacity: 0, x: -30, filter: 'blur(8px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.6, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
              >
                Borrowing Successful!
              </motion.h1>

              {/* Description — slides in from right with blur */}
              <motion.p
                className='w-full h-[64px] md:h-auto font-semibold text-base leading-[32px] text-center tracking-[-0.02em] text-[#0A0D12]'
                style={{ fontFamily: 'Quicksand, sans-serif' }}
                initial={{ opacity: 0, x: 30, filter: 'blur(8px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.6, delay: 1.3, ease: [0.22, 1, 0.36, 1] }}
              >
                Your book has been successfully borrowed. Please return it by{' '}
                <motion.span
                  className='text-red-600 font-bold'
                  initial={{ opacity: 0, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  transition={{ duration: 0.5, delay: 1.7, ease: 'easeOut' }}
                >
                  {getReturnDate()}
                </motion.span>
              </motion.p>
            </div>

            {/* Action Button — scale up with spring */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 18,
                delay: 1.9,
              }}
            >
              <Button
                variant='figma-primary'
                size='figma'
                onClick={handleGoToLoans}
                className='w-[286px] h-12 !rounded-full font-bold text-base leading-[30px] tracking-[-0.02em]'
                style={{ fontFamily: 'Quicksand, sans-serif' }}
              >
                <span className='font-bold text-base leading-[30px] tracking-[-0.02em] text-[#FDFDFD]'>
                  See Borrowed List
                </span>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
};
