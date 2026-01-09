import {
  IconActivity,
  IconBolt,
  IconBrain,
  IconChartBar,
  IconLock,
  IconMail,
  IconUser,
} from "@tabler/icons-react";
import z from "zod";

import { authClient } from "@/lib/auth-client";
import { toast } from "@/components/ui/sonner";

import {
  Box,
  Center,
  Loader as MantineLoader,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@tanstack/react-form";
import styles from "./signup.module.css";
import { Link, useNavigate } from "@tanstack/react-router";

function SignUpPage() {
  const navigate = useNavigate({
    from: "/signup",
  });
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
        },
        {
          onSuccess: () => {
            navigate({
              to: "/dashboard",
            });
            toast.success("Welcome to FitAI! Your fitness journey begins now.");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  if (isPending) {
    return (
      <Center h="100vh">
        <MantineLoader size="lg" />
      </Center>
    );
  }

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

  return (
    <div className={styles.wrapper}>
      {/* Left Panel - Branding */}
      <div className={styles.brandPanel}>
        <div className={styles.decorativeOrb} />

        <div className={styles.brandContent}>
          <div className={styles.logoContainer}>
            <div className={styles.logoIcon}>
              <IconActivity size={32} color="white" stroke={2} />
            </div>
            <span className={styles.logoText}>FitAI</span>
          </div>

          <h1 className={styles.tagline}>
            Transform Your <span className={styles.taglineHighlight}>Fitness Journey</span>
          </h1>

          <p className={styles.taglineSubtext}>
            Join thousands of athletes achieving their goals with intelligent workout tracking
          </p>

          <div className={styles.benefitsList}>
            {benefits.map((benefit) => (
              <div key={benefit.title} className={styles.benefitItem}>
                <div className={styles.benefitIcon}>
                  <benefit.icon size={18} color="white" stroke={2} />
                </div>
                <div className={styles.benefitContent}>
                  <div className={styles.benefitTitle}>{benefit.title}</div>
                  <div className={styles.benefitDescription}>{benefit.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social proof */}
        <div className={styles.socialProof}>
          <div className={styles.socialProofAvatars}>
            <div className={styles.socialProofAvatar}>JD</div>
            <div className={styles.socialProofAvatar}>MK</div>
            <div className={styles.socialProofAvatar}>AS</div>
            <div className={styles.socialProofAvatar}>+</div>
          </div>
          <span>Trusted by 10,000+ fitness enthusiasts</span>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className={styles.formPanel}>
        <div className={styles.gridPattern} />

        {/* Mobile logo */}
        <div className={styles.mobileLogo}>
          <div className={styles.mobileLogoIcon}>
            <IconActivity size={24} color="white" stroke={2} />
          </div>
          <span className={styles.mobileLogoText}>FitAI</span>
        </div>

        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Create your account</h2>
            <p className={styles.formSubtitle}>Start your fitness transformation today</p>
          </div>

          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <Stack gap="md">
              <form.Field name="name">
                {(field) => (
                  <Box className={styles.inputWrapper}>
                    <TextInput
                      label="Full Name"
                      placeholder="John Doe"
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      error={field.state.meta.errors[0]?.message}
                      leftSection={<IconUser size={18} />}
                      size="md"
                      styles={{
                        input: {
                          paddingLeft: 42,
                        },
                      }}
                    />
                  </Box>
                )}
              </form.Field>

              <form.Field name="email">
                {(field) => (
                  <Box className={styles.inputWrapper}>
                    <TextInput
                      label="Email Address"
                      placeholder="you@example.com"
                      id={field.name}
                      name={field.name}
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      error={field.state.meta.errors[0]?.message}
                      leftSection={<IconMail size={18} />}
                      size="md"
                      styles={{
                        input: {
                          paddingLeft: 42,
                        },
                      }}
                    />
                  </Box>
                )}
              </form.Field>

              <form.Field name="password">
                {(field) => (
                  <Box className={styles.inputWrapper}>
                    <PasswordInput
                      label="Password"
                      placeholder="Create a strong password"
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      error={field.state.meta.errors[0]?.message}
                      leftSection={<IconLock size={18} />}
                      size="md"
                      styles={{
                        input: {
                          paddingLeft: 42,
                        },
                      }}
                    />
                    {!field.state.meta.errors.length && (
                      <Text className={styles.passwordHint} c="dimmed" size="xs" mt={4}>
                        Must be at least 8 characters
                      </Text>
                    )}
                  </Box>
                )}
              </form.Field>

              <form.Subscribe>
                {(state) => (
                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={!state.canSubmit || state.isSubmitting}
                  >
                    {state.isSubmitting ? (
                      <span className={styles.loadingPulse}>
                        <span className={styles.loadingDot} />
                        <span className={styles.loadingDot} />
                        <span className={styles.loadingDot} />
                      </span>
                    ) : (
                      "Start Your Journey"
                    )}
                  </button>
                )}
              </form.Subscribe>
            </Stack>
          </form>

          <div className={styles.footerLink}>
            Already have an account?
            <Link to="/sign-in" className={styles.signInLink}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
