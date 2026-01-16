import { IconActivity } from "@tabler/icons-react";
import { Center, Loader as MantineLoader } from "@mantine/core";

import { authClient } from "@/lib/auth-client";
import { BrandPanel } from "./brand-panel";
import { SignupForm } from "./signup-form";
import styles from "./signup.module.css";

function MobileLogo() {
  return (
    <div className={styles.mobileLogo}>
      <div className={styles.mobileLogoIcon}>
        <IconActivity size={24} color="white" stroke={2} />
      </div>
      <span className={styles.mobileLogoText}>FitAI</span>
    </div>
  );
}

function SignUpPage() {
  const { isPending } = authClient.useSession();

  if (isPending) {
    return (
      <Center h="100vh">
        <MantineLoader size="lg" />
      </Center>
    );
  }

  return (
    <div className={styles.wrapper}>
      <BrandPanel />

      <div className={styles.formPanel}>
        <div className={styles.gridPattern} />
        <MobileLogo />
        <SignupForm />
      </div>
    </div>
  );
}

export default SignUpPage;
