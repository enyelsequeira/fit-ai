import { IconActivity, IconBolt, IconBrain, IconChartBar } from "@tabler/icons-react";
import { Flex, Text, Title } from "@mantine/core";
import styles from "./signup.module.css";

const benefits = [
  {
    icon: IconActivity,
    title: "Track Every Workout",
    description: "Log exercises, sets, reps, and watch your progress unfold",
  },
  {
    icon: IconBrain,
    title: "AI-Powered Insights",
    description: "Get personalized recommendations based on your performance",
  },
  {
    icon: IconChartBar,
    title: "Progress Analytics",
    description: "Visualize your gains with detailed charts and statistics",
  },
  {
    icon: IconBolt,
    title: "Recovery Tracking",
    description: "Optimize rest days and prevent overtraining",
  },
];

function BenefitItem({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof IconActivity;
  title: string;
  description: string;
}) {
  return (
    <div className={styles.benefitItem}>
      <div className={styles.benefitIcon}>
        <Icon size={18} color="white" stroke={2} />
      </div>
      <Flex flex={1}>
        <Text fw={600} c="white" mb={2} fz="sm">
          {title}
        </Text>
        <Text c="gray.2" fz="sm">
          {description}
        </Text>
      </Flex>
    </div>
  );
}

function SocialProof() {
  return (
    <div className={styles.socialProof}>
      <div className={styles.socialProofAvatars}>
        <div className={styles.socialProofAvatar}>JD</div>
        <div className={styles.socialProofAvatar}>MK</div>
        <div className={styles.socialProofAvatar}>AS</div>
        <div className={styles.socialProofAvatar}>+</div>
      </div>
      <span>Trusted by 10,000+ fitness enthusiasts</span>
    </div>
  );
}

export function BrandPanel() {
  return (
    <div className={styles.brandPanel}>
      <div className={styles.decorativeOrb} />

      <div className={styles.brandContent}>
        <Flex justify="center" align="center" mb="xl" gap="sm">
          <div className={styles.logoIcon}>
            <IconActivity size={32} color="white" stroke={2} />
          </div>
          <Text fz="xl" fw={700} c="white">
            FitAI
          </Text>
        </Flex>

        <Title order={2} fw={600} fz="1.75rem">
          Transform Your <span className={styles.taglineHighlight}>Fitness Journey</span>
        </Title>

        <Text fz="xl" c="white" mb="xl">
          Join thousands of athletes achieving their goals with intelligent workout tracking
        </Text>

        <Flex direction="column" gap="md" ta="left" mt="xl">
          {benefits.map((benefit) => (
            <BenefitItem key={benefit.title} {...benefit} />
          ))}
        </Flex>
      </div>

      <SocialProof />
    </div>
  );
}
