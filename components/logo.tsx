import Link from "next/link";
import SplitText from "@/components/textanimations/SplitText/SplitText";

export const Lwiz = () => (
  <h1 className="text-8xl font-bold text-center mb-6">
    <Link href="/">
      <SplitText
        text="Lwiz."
        className="text-center"
        delay={150}
        animationFrom={{
          opacity: 0,
          transform: "translate3d(0,50px,0)",
        }}
        animationTo={{ opacity: 1, transform: "translate3d(0,0,0)" }}
        threshold={0.2}
        rootMargin="-50px"
      />
    </Link>
  </h1>
);

export default Lwiz;
