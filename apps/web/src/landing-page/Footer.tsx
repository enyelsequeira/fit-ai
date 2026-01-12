import { Link } from "@tanstack/react-router";
import {
  IconBolt,
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandTwitter,
} from "@tabler/icons-react";

import { Box, Container, Grid, Group, Text } from "@mantine/core";

import classes from "./Footer.module.css";

const footerLinks = {
  product: {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "mailto:support@fit-ai.app" },
    ],
  },
  resources: {
    title: "Resources",
    links: [
      { label: "Exercise Library", href: "/exercises" },
      { label: "Workout Templates", href: "/templates" },
      { label: "Help Center", href: "/help" },
      { label: "API Docs", href: "/docs" },
    ],
  },
};

const socialLinks = [
  { icon: IconBrandTwitter, href: "https://twitter.com/fitai", label: "Twitter" },
  { icon: IconBrandInstagram, href: "https://instagram.com/fitai", label: "Instagram" },
  { icon: IconBrandGithub, href: "https://github.com/fitai", label: "GitHub" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <Box component="footer" className={classes.footer} role="contentinfo">
      <Container size="lg">
        {/* Top Section */}
        <Box className={classes.topSection}>
          <Grid gutter={{ base: 32, lg: 64 }}>
            {/* Brand Column */}
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Box className={classes.brand}>
                <Link to="/" className={classes.logo} aria-label="FIT-AI Home">
                  <Box className={classes.logoIcon}>
                    <IconBolt size={22} color="white" aria-hidden="true" />
                  </Box>
                  <Text fw={700} fz="xl" c="white">
                    FIT-AI
                  </Text>
                </Link>
                <Text className={classes.brandDescription}>
                  Your AI-powered fitness companion. Track workouts, get personalized
                  recommendations, and achieve your goals faster.
                </Text>
                <Box className={classes.socialLinks}>
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      className={classes.socialLink}
                      aria-label={social.label}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <social.icon size={18} aria-hidden="true" />
                    </a>
                  ))}
                </Box>
              </Box>
            </Grid.Col>

            {/* Links Columns */}
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Box className={classes.linksSection}>
                {Object.values(footerLinks).map((group) => (
                  <Box key={group.title} className={classes.linkGroup}>
                    <Text className={classes.linkGroupTitle}>{group.title}</Text>
                    {group.links.map((link) => (
                      <a key={link.label} href={link.href} className={classes.link}>
                        {link.label}
                      </a>
                    ))}
                  </Box>
                ))}
              </Box>
            </Grid.Col>
          </Grid>
        </Box>

        {/* Bottom Section */}
        <Group justify="space-between" className={classes.bottomSection}>
          <Text className={classes.copyright}>{year} FIT-AI. All rights reserved.</Text>
          <Box className={classes.bottomLinks}>
            <Link to="/privacy" className={classes.bottomLink}>
              Privacy Policy
            </Link>
            <Link to="/terms" className={classes.bottomLink}>
              Terms of Service
            </Link>
            <a href="/cookies" className={classes.bottomLink}>
              Cookies
            </a>
          </Box>
        </Group>
      </Container>
    </Box>
  );
}
