import { Link } from "@tanstack/react-router";
import styles from "@/components/dashboard/layout/layout.module.css";
import type { NavLinkItem } from "@/components/dashboard/layout/constants.tsx";

const DashboardNavLink = ({
  item,
  isActive,
  onClick,
}: {
  item: NavLinkItem;
  isActive: boolean;
  onClick?: () => void;
}) => {
  const Icon = item.icon;
  return (
    <Link
      to={item.href}
      className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
      onClick={onClick}
    >
      <span className={styles.navLinkIcon}>
        <Icon size={20} stroke={1.5} />
      </span>
      <span>{item.label}</span>
    </Link>
  );
};

export default DashboardNavLink;
