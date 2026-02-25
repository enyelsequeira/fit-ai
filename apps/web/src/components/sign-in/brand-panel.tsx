import {
  IconActivity,
  IconBrain,
  IconChartBar,
  IconCircleCheck,
  IconTarget,
} from "@tabler/icons-react";
import { Flex, Text, Title } from "@mantine/core";

import styles from "./sign-in.module.css";

const benefits = [
  {
    icon: IconBrain,
    title: "AI-Powered Insights",
    description: "Personalized recommendations adapting to your progress",
  },
  {
    icon: IconChartBar,
    title: "Progress Analytics",
    description: "Track your gains with detailed performance data",
  },
  {
    icon: IconTarget,
    title: "Goal Tracking",
    description: "Stay on course with personalized milestones",
  },
  {
    icon: IconCircleCheck,
    title: "Recovery Optimization",
    description: "Smart rest recommendations for peak performance",
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
      <Flex flex={1} direction="column">
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
        {["JD", "MK", "AS", "+"].map((label) => (
          <div key={label} className={styles.socialProofAvatar}>
            {label}
          </div>
        ))}
      </div>
      <span>Trusted by 10,000+ fitness enthusiasts</span>
    </div>
  );
}

export function BrandPanel() {
  return (
    <div className={styles.brandPanel}>
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
          Welcome Back to Your <span className={styles.taglineHighlight}>Fitness Journey</span>
        </Title>

        <Text fz="xl" c="white" mb="xl">
          Continue crushing your goals with intelligent workout tracking
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
