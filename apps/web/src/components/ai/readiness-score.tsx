import { Box, Flex, SimpleGrid, Stack, Text } from "@mantine/core";

interface ReadinessScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showRecommendation?: boolean;
  recommendation?: string;
}

function getScoreColor(score: number) {
  if (score >= 70)
    return { ring: "var(--mantine-color-green-6)", text: "green", bg: "rgba(34, 197, 94, 0.1)" };
  if (score >= 40)
    return { ring: "var(--mantine-color-yellow-6)", text: "yellow", bg: "rgba(245, 158, 11, 0.1)" };
  return { ring: "var(--mantine-color-red-6)", text: "red", bg: "rgba(239, 68, 68, 0.1)" };
}

function getDefaultRecommendation(score: number) {
  if (score >= 70) return "Ready for hard training!";
  if (score >= 40) return "Light training recommended";
  return "Rest day suggested";
}

function ReadinessScore({
  score,
  size = "md",
  showRecommendation = true,
  recommendation,
}: ReadinessScoreProps) {
  const colors = getScoreColor(score);
  const displayRecommendation = recommendation ?? getDefaultRecommendation(score);

  const sizeConfig = {
    sm: { svg: 80, stroke: 6, fontSize: "lg" as const, labelSize: "xs" as const },
    md: { svg: 120, stroke: 8, fontSize: "xl" as const, labelSize: "sm" as const },
    lg: { svg: 160, stroke: 10, fontSize: 32, labelSize: "md" as const },
  };

  const config = sizeConfig[size];
  const radius = (config.svg - config.stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <Stack align="center" gap="sm">
      <Box pos="relative">
        <svg
          width={config.svg}
          height={config.svg}
          viewBox={`0 0 ${config.svg} ${config.svg}`}
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle
            cx={config.svg / 2}
            cy={config.svg / 2}
            r={radius}
            fill="none"
            strokeWidth={config.stroke}
            stroke="var(--mantine-color-dark-4)"
          />
          <circle
            cx={config.svg / 2}
            cy={config.svg / 2}
            r={radius}
            fill="none"
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            stroke={colors.ring}
            style={{ transition: "all 0.5s ease-out" }}
          />
        </svg>
        <Flex
          pos="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          direction="column"
          align="center"
          justify="center"
        >
          <Text
            fz={config.fontSize}
            fw={700}
            c={colors.text}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {score}
          </Text>
          <Text fz={config.labelSize} c="dimmed">
            / 100
          </Text>
        </Flex>
      </Box>
      {showRecommendation && (
        <Box
          px="sm"
          py={6}
          ta="center"
          fz="xs"
          fw={500}
          c={colors.text}
          style={{ backgroundColor: colors.bg }}
        >
          {displayRecommendation}
        </Box>
      )}
    </Stack>
  );
}

interface FactorsBreakdownProps {
  factors: {
    sleepScore: number | null;
    energyScore: number | null;
    sorenessScore: number | null;
    stressScore: number | null;
    muscleRecoveryScore: number | null;
  };
}

function FactorsBreakdown({ factors }: FactorsBreakdownProps) {
  const items = [
    { label: "Sleep", value: factors.sleepScore, icon: "sleep" },
    { label: "Energy", value: factors.energyScore, icon: "energy" },
    { label: "Soreness", value: factors.sorenessScore, icon: "soreness" },
    { label: "Stress", value: factors.stressScore, icon: "stress" },
    { label: "Muscle Recovery", value: factors.muscleRecoveryScore, icon: "muscle" },
  ];

  return (
    <SimpleGrid cols={5} spacing="xs">
      {items.map((item) => {
        const value = item.value ?? 0;
        const colors = getScoreColor(value);

        return (
          <Stack key={item.label} align="center" gap={4}>
            <Flex
              h={32}
              w={32}
              align="center"
              justify="center"
              fz="xs"
              fw={500}
              c={colors.text}
              style={{ backgroundColor: colors.bg, borderRadius: "50%" }}
            >
              {item.value !== null ? value : "-"}
            </Flex>
            <Text fz={10} c="dimmed" ta="center" lh={1.2}>
              {item.label}
            </Text>
          </Stack>
        );
      })}
    </SimpleGrid>
  );
}

export { ReadinessScore, FactorsBreakdown, getScoreColor, getDefaultRecommendation };
