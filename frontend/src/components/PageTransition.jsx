import { motion } from "framer-motion";

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: -8,
      }}
      transition={{
        duration: 0.28,
        ease: "easeOut",
      }}
      style={{
        width: "100%",
        minHeight: "100%",
      }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;