import { IconActivity } from "@tabler/icons-react";
import { Center, Loader as MantineLoader } from "@mantine/core";

import { authClient } from "@/lib/auth-client";
import { BrandPanel } from "./brand-panel";
import { SignInForm } from "./sign-in-form";
import styles from "./sign-in.module.css";

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

function SignInPage() {
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
        <MobileLogo />
        <SignInForm />
      </div>
    </div>
  );
}

export default SignInPage;
