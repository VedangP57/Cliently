"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Affix, Alert, Anchor, App, AutoComplete, Avatar, Badge, Breadcrumb,
  Button, Calendar, Card, Carousel, Cascader, Checkbox, Col, Collapse,
  ColorPicker, ConfigProvider, DatePicker, Descriptions, Divider, Drawer,
  Dropdown, Empty, Flex, FloatButton, Form, Image, Input, InputNumber,
  Layout, List, Masonry, Mentions, Menu, Modal, Pagination,
  Popconfirm, Popover, Progress, QRCode, Radio, Rate, Result, Row, Select,
  Segmented, Skeleton, Slider, Space, Spin, Splitter, Statistic, Steps,
  Switch, Table, Tabs, Tag, TimePicker, Timeline, Tooltip, Tour, Transfer,
  Tree, TreeSelect, Typography, Upload, Watermark, message, notification, theme,
} from "antd";
import {
  UserOutlined, UploadOutlined, InboxOutlined, SmileOutlined,
  HomeOutlined, SettingOutlined, AppstoreOutlined, PlusOutlined,
  DownOutlined, HeartOutlined, StarOutlined, DeleteOutlined,
  BellOutlined, FileOutlined, CheckCircleOutlined, ClockCircleOutlined,
  EditOutlined, EyeOutlined, MailOutlined, PhoneOutlined,
  SunOutlined, MoonOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph, Link } = Typography;
const { Header, Sider, Content, Footer } = Layout;

function useIsDark() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    setIsDark(root.classList.contains("dark"));
    const observer = new MutationObserver(() =>
      setIsDark(root.classList.contains("dark"))
    );
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = useCallback(() => {
    const next = isDark ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
  }, [isDark]);

  return { isDark, toggleTheme };
}

function Section({ title, id, children }: { title: string; id: string; children: React.ReactNode }) {
  return (
    <div id={id} style={{ marginBottom: 56 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, paddingBottom: 12, borderBottom: "2px solid #1677ff" }}>
        <Title level={2} style={{ margin: 0, color: "#1677ff" }}>{title}</Title>
      </div>
      {children}
    </div>
  );
}

function CCard({ title, num, children }: { title: string; num: number; children: React.ReactNode }) {
  return (
    <div id={`c${num}`} style={{ scrollMarginTop: 48 }}>
      <Card
        size="small"
        title={
          <Space size={8}>
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, background: "#1677ff", color: "#fff", borderRadius: 4, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{num}</span>
            <Text style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</Text>
          </Space>
        }
        style={{ marginBottom: 16 }}
        variant="outlined"
      >
        <div style={{ padding: "4px 0" }}>{children}</div>
      </Card>
    </div>
  );
}

const COMPONENT_INDEX = [
  { num: 1,  label: "Button",        section: "general" },
  { num: 2,  label: "FloatButton",   section: "general" },
  { num: 3,  label: "Icon",          section: "general" },
  { num: 4,  label: "Typography",    section: "general" },
  { num: 5,  label: "Divider",       section: "layout" },
  { num: 6,  label: "Flex",          section: "layout" },
  { num: 7,  label: "Grid",          section: "layout" },
  { num: 8,  label: "Layout",        section: "layout" },
  { num: 9,  label: "Masonry",       section: "layout" },
  { num: 10, label: "Space",         section: "layout" },
  { num: 11, label: "Splitter",      section: "layout" },
  { num: 12, label: "Anchor",        section: "nav" },
  { num: 13, label: "Breadcrumb",    section: "nav" },
  { num: 14, label: "Dropdown",      section: "nav" },
  { num: 15, label: "Menu",          section: "nav" },
  { num: 16, label: "Pagination",    section: "nav" },
  { num: 17, label: "Steps",         section: "nav" },
  { num: 18, label: "Tabs",          section: "nav" },
  { num: 19, label: "AutoComplete",  section: "entry" },
  { num: 20, label: "Cascader",      section: "entry" },
  { num: 21, label: "Checkbox",      section: "entry" },
  { num: 22, label: "ColorPicker",   section: "entry" },
  { num: 23, label: "DatePicker",    section: "entry" },
  { num: 24, label: "Form",          section: "entry" },
  { num: 25, label: "Input",         section: "entry" },
  { num: 26, label: "InputNumber",   section: "entry" },
  { num: 27, label: "Mentions",      section: "entry" },
  { num: 28, label: "Radio",         section: "entry" },
  { num: 29, label: "Rate",          section: "entry" },
  { num: 30, label: "Select",        section: "entry" },
  { num: 31, label: "Slider",        section: "entry" },
  { num: 32, label: "Switch",        section: "entry" },
  { num: 33, label: "TimePicker",    section: "entry" },
  { num: 34, label: "Transfer",      section: "entry" },
  { num: 35, label: "TreeSelect",    section: "entry" },
  { num: 36, label: "Upload",        section: "entry" },
  { num: 37, label: "Avatar",        section: "display" },
  { num: 38, label: "Badge",         section: "display" },
  { num: 39, label: "Segmented",     section: "display" },
  { num: 40, label: "Statistic",     section: "display" },
  { num: 41, label: "Tag",           section: "display" },
  { num: 42, label: "Tooltip",       section: "display" },
  { num: 43, label: "Popover",       section: "display" },
  { num: 44, label: "QRCode",        section: "display" },
  { num: 45, label: "Empty",         section: "display" },
  { num: 46, label: "Card",          section: "display" },
  { num: 47, label: "Carousel",      section: "display" },
  { num: 48, label: "Collapse",      section: "display" },
  { num: 49, label: "Descriptions",  section: "display" },
  { num: 50, label: "Table",         section: "display" },
  { num: 51, label: "List",          section: "display" },
  { num: 52, label: "Timeline",      section: "display" },
  { num: 53, label: "Tree",          section: "display" },
  { num: 54, label: "Calendar",      section: "display" },
  { num: 55, label: "Image",         section: "display" },
  { num: 56, label: "Tour",          section: "display" },
  { num: 57, label: "Alert",         section: "feedback" },
  { num: 58, label: "Progress",      section: "feedback" },
  { num: 59, label: "Skeleton",      section: "feedback" },
  { num: 60, label: "Spin",          section: "feedback" },
  { num: 61, label: "Result",        section: "feedback" },
  { num: 62, label: "Watermark",     section: "feedback" },
  { num: 63, label: "Modal",         section: "feedback" },
  { num: 64, label: "Drawer",        section: "feedback" },
  { num: 65, label: "Message",       section: "feedback" },
  { num: 66, label: "Notification",  section: "feedback" },
  { num: 67, label: "Popconfirm",    section: "feedback" },
  { num: 68, label: "Affix",         section: "other" },
  { num: 69, label: "App",           section: "other" },
  { num: 70, label: "ConfigProvider",section: "other" },
  { num: 71, label: "Util",          section: "other" },
];

const SECTION_COLORS: Record<string, string> = {
  general:  "#1677ff",
  layout:   "#722ed1",
  nav:      "#13c2c2",
  entry:    "#52c41a",
  display:  "#fa8c16",
  feedback: "#ff4d4f",
  other:    "#8c8c8c",
};

const transferData = Array.from({ length: 8 }, (_, i) => ({
  key: String(i), title: `Item ${i + 1}`, description: `Description ${i + 1}`,
}));

const tableColumns = [
  { title: "Name", dataIndex: "name", key: "name" },
  { title: "Role", dataIndex: "role", key: "role" },
  { title: "Status", dataIndex: "status", key: "status", render: (v: string) => <Tag color={v === "Active" ? "green" : "orange"}>{v}</Tag> },
  { title: "Action", key: "action", render: () => <Space><Link>Edit</Link><Link type="danger">Delete</Link></Space> },
];

const tableData = [
  { key: "1", name: "Alice Johnson", role: "Designer", status: "Active" },
  { key: "2", name: "Bob Smith", role: "Developer", status: "Inactive" },
  { key: "3", name: "Carol White", role: "Manager", status: "Active" },
];

type ProjectRow = { key: string; title: string; client: string; status: string; deadline: string; budget: string };

const projectDemoData: ProjectRow[] = [
  { key: "1",  title: "Cliently Redesign",    client: "Alice Johnson", status: "in_progress", deadline: "Jun 30, 2026", budget: "$4,500" },
  { key: "2",  title: "Mobile App MVP",        client: "Bob Smith",     status: "planning",    deadline: "Aug 15, 2026", budget: "$12,000" },
  { key: "3",  title: "API Integration",       client: "Carol White",   status: "review",      deadline: "Jun 10, 2026", budget: "$2,800" },
  { key: "4",  title: "Dashboard Analytics",   client: "David Lee",     status: "completed",   deadline: "May 20, 2026", budget: "$3,200" },
  { key: "5",  title: "E-Commerce Platform",   client: "Eva Green",     status: "in_progress", deadline: "Sep 1, 2026",  budget: "$18,500" },
  { key: "6",  title: "Brand Guidelines",      client: "Frank Miller",  status: "completed",   deadline: "Apr 30, 2026", budget: "$1,500" },
  { key: "7",  title: "CRM Migration",         client: "Grace Hall",    status: "on_hold",     deadline: "Jul 15, 2026", budget: "$6,400" },
  { key: "8",  title: "SEO Audit",             client: "Henry Adams",   status: "planning",    deadline: "Jun 25, 2026", budget: "$900" },
  { key: "9",  title: "Payment Gateway",       client: "Iris Chen",     status: "in_progress", deadline: "Jul 5, 2026",  budget: "$5,200" },
  { key: "10", title: "Email Automation",      client: "Jack Wilson",   status: "review",      deadline: "Jun 12, 2026", budget: "$2,100" },
  { key: "11", title: "Landing Page Suite",    client: "Karen Brown",   status: "cancelled",   deadline: "May 1, 2026",  budget: "$1,800" },
  { key: "12", title: "Inventory System",      client: "Leo Martinez",  status: "in_progress", deadline: "Aug 30, 2026", budget: "$9,700" },
];

const treeData = [
  {
    title: "Invoices", key: "invoices",
    children: [
      { title: "Draft", key: "draft" },
      { title: "Sent", key: "sent", children: [{ title: "Paid", key: "paid" }, { title: "Overdue", key: "overdue" }] },
    ],
  },
  {
    title: "Proposals", key: "proposals",
    children: [{ title: "Pending", key: "p-pending" }, { title: "Accepted", key: "p-accepted" }],
  },
];

export default function TestingPage() {
  const { isDark, toggleTheme } = useIsDark();
  const [mounted, setMounted] = useState(false);
  const [projectSearch, setProjectSearch] = useState("");
  const [projectStatus, setProjectStatus] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [transferKeys, setTransferKeys] = useState<string[]>(["2", "4"]);
  const [msgApi, msgCtx] = message.useMessage();
  const [notifApi, notifCtx] = notification.useNotification();
  const tourRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  return (
    <ConfigProvider>
      <App>
        {msgCtx}
        {notifCtx}
        <div style={{ background: "hsl(var(--background))", minHeight: "100vh" }}>

          {/* ── PAGE HEADER ─────────────────────────────────────────── */}
          <div style={{ background: "linear-gradient(135deg, #001529 0%, #1677ff 100%)", padding: "48px 48px 40px", textAlign: "center" }}>
            <svg viewBox="64 64 896 896" width="72" height="72" fill="#fff" style={{ marginBottom: 16, display: "block", margin: "0 auto 16px" }}>
              <path d="M854.6 288.7c6 6 9.4 14.1 9.4 22.6V928c0 17.7-14.3 32-32 32H192c-17.7 0-32-14.3-32-32V96c0-17.7 14.3-32 32-32h424.7c8.5 0 16.7 3.4 22.7 9.4l215.2 215.3zM790.2 326L602 137.8V326h188.2zM320 482a8 8 0 0 0-8 8v48a8 8 0 0 0 8 8h384a8 8 0 0 0 8-8v-48a8 8 0 0 0-8-8H320zm0 136a8 8 0 0 0-8 8v48a8 8 0 0 0 8 8h384a8 8 0 0 0 8-8v-48a8 8 0 0 0-8-8H320zm0 136a8 8 0 0 0-8 8v48a8 8 0 0 0 8 8h184a8 8 0 0 0 8-8v-48a8 8 0 0 0-8-8H320z" />
            </svg>
            <Title level={1} style={{ color: "#fff", margin: "0 0 8px" }}>Ant Design v6 — Component Showcase</Title>
            <Text style={{ color: "hsl(var(--foreground) / 0.75)", fontSize: 16 }}>
              Every component · General · Layout · Navigation · Data Entry · Data Display · Feedback · Other
            </Text>
          </div>

          {/* ── COMPONENT INDEX GRID ────────────────────────────────── */}
          <div style={{ background: "hsl(var(--card))", padding: "24px 48px", borderBottom: "1px solid hsl(var(--border))" }}>
            <Text style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--foreground))", display: "block", marginBottom: 12 }}>
              Quick Jump — click any number to go directly to that component
            </Text>
            <Flex wrap gap={6}>
              {COMPONENT_INDEX.map(({ num, label, section }) => (
                <a key={num} href={`#c${num}`} style={{ textDecoration: "none" }}>
                  <Tooltip title={label} placement="top">
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "3px 8px 3px 4px", borderRadius: 6, cursor: "pointer",
                      border: `1px solid ${SECTION_COLORS[section]}22`,
                      background: `${SECTION_COLORS[section]}0d`,
                      transition: "all 0.15s",
                    }}>
                      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, background: SECTION_COLORS[section], color: "#fff", borderRadius: 4, fontSize: 10, fontWeight: 700 }}>{num}</span>
                      <Text style={{ fontSize: 11, color: SECTION_COLORS[section], fontWeight: 600, whiteSpace: "nowrap" }}>{label}</Text>
                    </div>
                  </Tooltip>
                </a>
              ))}
            </Flex>
            <Divider style={{ margin: "12px 0 0" }} />
            <Flex gap={16} wrap style={{ marginTop: 8 }}>
              {Object.entries({ General: "general", Layout: "layout", Navigation: "nav", "Data Entry": "entry", "Data Display": "display", Feedback: "feedback", Other: "other" }).map(([label, key]) => (
                <Space key={key} size={4}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: SECTION_COLORS[key], display: "inline-block" }} />
                  <Text style={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}>{label}</Text>
                </Space>
              ))}
            </Flex>
          </div>

          {/* ── STICKY ANCHOR NAV ───────────────────────────────────── */}
          <Affix offsetTop={0}>
            <div style={{ background: "hsl(var(--card))", borderBottom: "1px solid hsl(var(--border))", padding: "0 48px", display: "flex", alignItems: "center" }}>
              <div style={{ flex: 1, display: "flex", overflow: "auto" }}>
                {([
                  ["general", "General"], ["layout", "Layout"], ["nav", "Navigation"],
                  ["entry", "Data Entry"], ["display", "Data Display"],
                  ["feedback", "Feedback"], ["other", "Other"],
                ] as [string, string][]).map(([id, label]) => (
                  <a key={id} href={`#${id}`} style={{
                    display: "inline-flex", alignItems: "center",
                    padding: "12px 16px", fontSize: 14, fontWeight: 500,
                    color: "hsl(var(--muted-foreground))", textDecoration: "none",
                    whiteSpace: "nowrap", flexShrink: 0,
                  }}>
                    {label}
                  </a>
                ))}
              </div>
              <Tooltip title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
                <Button
                  type="text"
                  size="small"
                  icon={isDark ? <SunOutlined /> : <MoonOutlined />}
                  onClick={toggleTheme}
                  style={{ flexShrink: 0, marginLeft: 8 }}
                />
              </Tooltip>
            </div>
          </Affix>

          {/* ── MAIN CONTENT ────────────────────────────────────────── */}
          <div style={{ padding: "40px 48px", maxWidth: 1200, margin: "0 auto" }}>

            {/* ═══════════════════════════════════════════════════════
                1. GENERAL
            ════════════════════════════════════════════════════════ */}
            <Section title="General" id="general">
              <CCard title="Button" num={1}>
                <Space wrap>
                  <Button type="primary">Primary</Button>
                  <Button>Default</Button>
                  <Button type="dashed">Dashed</Button>
                  <Button type="text">Text</Button>
                  <Button type="link">Link</Button>
                  <Button danger>Danger</Button>
                  <Button type="primary" danger>Primary Danger</Button>
                  <Button type="primary" loading>Loading</Button>
                  <Button type="primary" icon={<PlusOutlined />}>With Icon</Button>
                  <Button shape="circle" icon={<UserOutlined />} />
                  <Button shape="round">Round</Button>
                  <Button size="small">Small</Button>
                  <Button size="large">Large</Button>
                  <Button type="primary" ghost>Ghost</Button>
                  <Button disabled>Disabled</Button>
                </Space>
              </CCard>

              <CCard title="FloatButton" num={2}>
                <Text type="secondary">FloatButton renders fixed at the bottom-right corner.</Text>
                <div style={{ position: "relative", height: 80, border: "1px dashed hsl(var(--border))", borderRadius: 8, marginTop: 8 }}>
                  {mounted && (
                    <FloatButton.Group shape="circle" style={{ insetInlineEnd: 16, bottom: 16 }}>
                      <FloatButton icon={<PlusOutlined />} tooltip="New Invoice" />
                      <FloatButton icon={<MailOutlined />} tooltip="Send Email" />
                      <FloatButton.BackTop visibilityHeight={0} style={{ position: "relative", inset: "unset" }} />
                    </FloatButton.Group>
                  )}
                </div>
              </CCard>

              <CCard title="Icon  (@ant-design/icons)" num={3}>
                <Space wrap size="large">
                  {[UserOutlined, HomeOutlined, SettingOutlined, BellOutlined, FileOutlined,
                    CheckCircleOutlined, ClockCircleOutlined, EditOutlined, EyeOutlined,
                    HeartOutlined, StarOutlined, DeleteOutlined, MailOutlined, PhoneOutlined,
                    SmileOutlined, UploadOutlined, InboxOutlined, AppstoreOutlined, DownOutlined, PlusOutlined,
                  ].map((Icon, i) => (
                    <Tooltip key={i} title={Icon.displayName || "Icon"}>
                      <Button icon={<Icon />} type="text" size="large" />
                    </Tooltip>
                  ))}
                </Space>
              </CCard>

              <CCard title="Typography" num={4}>
                <Title>h1 — Ant Design</Title>
                <Title level={2}>h2 — Ant Design</Title>
                <Title level={3}>h3 — Ant Design</Title>
                <Title level={4}>h4 — Ant Design</Title>
                <Title level={5}>h5 — Ant Design</Title>
                <Divider />
                <Paragraph>
                  <Text strong>Strong</Text> · <Text italic>Italic</Text> · <Text underline>Underline</Text> ·{" "}
                  <Text delete>Delete</Text> · <Text code>code</Text> · <Text mark>Mark</Text> ·{" "}
                  <Text keyboard>Ctrl</Text> · <Text type="secondary">Secondary</Text> · <Text type="success">Success</Text> ·{" "}
                  <Text type="warning">Warning</Text> · <Text type="danger">Danger</Text> · <Link href="#">Link</Link>
                </Paragraph>
                <Paragraph copyable>This text is copyable — click the icon on the right.</Paragraph>
                <Paragraph editable>This text is editable — click to edit.</Paragraph>
                <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: "more" }}>
                  Ant Design is a design system for enterprise-level products. It creates an efficient and enjoyable work experience. With this design system, designers and developers don't need to worry about design details; they can build pages at an unprecedented pace.
                </Paragraph>
              </CCard>
            </Section>

            {/* ═══════════════════════════════════════════════════════
                2. LAYOUT
            ════════════════════════════════════════════════════════ */}
            <Section title="Layout" id="layout">
              <CCard title="Divider" num={5}>
                <Paragraph>Above horizontal divider</Paragraph>
                <Divider />
                <Paragraph>With text (left)</Paragraph>
                <Divider titlePlacement="left">Left Text</Divider>
                <Paragraph>With text (center)</Paragraph>
                <Divider>Center Text</Divider>
                <Paragraph>With text (right)</Paragraph>
                <Divider titlePlacement="right" dashed>Right Dashed</Divider>
                <Space>
                  <Text>Inline</Text><Divider orientation="vertical" /><Text>Vertical</Text><Divider orientation="vertical" /><Text>Divider</Text>
                </Space>
              </CCard>

              <CCard title="Flex" num={6}>
                <Flex gap={8} wrap style={{ marginBottom: 12 }}>
                  {["#f56a00", "#7265e6", "#ffbf00", "#00a2ae", "#1677ff", "#52c41a"].map((c) => (
                    <div key={c} style={{ width: 60, height: 40, background: c, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11 }}>{c.slice(1)}</div>
                  ))}
                </Flex>
                <Flex justify="space-between" align="center" style={{ padding: "8px 0" }}>
                  <Button>Left</Button><Button type="primary">Center</Button><Button>Right</Button>
                </Flex>
                <Flex vertical gap={8} style={{ marginTop: 8 }}>
                  <Alert title="Flex vertical item 1" type="info" />
                  <Alert title="Flex vertical item 2" type="success" />
                </Flex>
              </CCard>

              <CCard title="Grid — Row & Col" num={7}>
                <Space orientation="vertical" style={{ width: "100%" }}>
                  <Row gutter={8}>
                    {[8, 8, 8].map((s, i) => <Col key={i} span={s}><div style={{ background: "#1677ff", color: "#fff", height: 36, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>Col-8</div></Col>)}
                  </Row>
                  <Row gutter={8}>
                    {[6, 6, 6, 6].map((s, i) => <Col key={i} span={s}><div style={{ background: "#69b1ff", height: 36, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>Col-6</div></Col>)}
                  </Row>
                  <Row gutter={8}>
                    <Col span={12}><div style={{ background: "#bae0ff", height: 36, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>Col-12</div></Col>
                    <Col span={6}><div style={{ background: "#91caff", height: 36, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>Col-6</div></Col>
                    <Col span={6}><div style={{ background: "#4096ff", color: "#fff", height: 36, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>Col-6</div></Col>
                  </Row>
                </Space>
              </CCard>

              <CCard title="Layout" num={8}>
                <Layout style={{ minHeight: 180, borderRadius: 8, overflow: "hidden", border: "1px solid hsl(var(--border))" }}>
                  <Header style={{ background: "#001529", color: "#fff", display: "flex", alignItems: "center", padding: "0 24px" }}>
                    <Text style={{ color: "#fff", fontWeight: 600 }}>Header</Text>
                  </Header>
                  <Layout>
                    <Sider width={100} style={{ background: "#002140", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ color: "rgba(255,255,255,0.65)" }}>Sider</Text>
                    </Sider>
                    <Content style={{ background: "hsl(var(--muted))", padding: 24, minHeight: 80 }}>
                      <Text type="secondary">Main Content Area</Text>
                    </Content>
                  </Layout>
                  <Footer style={{ textAlign: "center", background: "hsl(var(--accent))", padding: "12px 24px" }}>
                    <Text type="secondary">Footer</Text>
                  </Footer>
                </Layout>
              </CCard>

              <CCard title="Masonry" num={9}>
                <Masonry
                  columns={3}
                  gutter={12}
                  items={[120, 80, 160, 100, 140, 90, 110, 130, 75].map((h, i) => ({
                    key: String(i),
                    data: { h, i },
                    children: (
                      <div style={{ height: h, background: `hsl(${i * 40}, 60%, 75%)`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Text>Card {i + 1}</Text>
                      </div>
                    ),
                  }))}
                  itemRender={({ children }) => children}
                />
              </CCard>

              <CCard title="Space" num={10}>
                <Space orientation="vertical" style={{ width: "100%" }}>
                  <Space>
                    <Button>Small Gap (default)</Button><Button type="primary">Between</Button><Button>Buttons</Button>
                  </Space>
                  <Space size="large" wrap>
                    <Tag color="blue">Large</Tag><Tag color="green">Gap</Tag><Tag color="red">Between</Tag><Tag color="orange">Tags</Tag>
                  </Space>
                  <Space size={[8, 16]} wrap>
                    {Array.from({ length: 8 }, (_, i) => <Button key={i} size="small">Item {i + 1}</Button>)}
                  </Space>
                </Space>
              </CCard>

              <CCard title="Splitter" num={11}>
                <Splitter style={{ height: 140, border: "1px solid hsl(var(--border))", borderRadius: 8, overflow: "hidden" }}>
                  <Splitter.Panel defaultSize="35%" min="20%" max="70%">
                    <div style={{ padding: 16 }}>
                      <Text strong>Left Panel</Text><br />
                      <Text type="secondary" style={{ fontSize: 12 }}>Drag the divider →</Text>
                    </div>
                  </Splitter.Panel>
                  <Splitter.Panel>
                    <div style={{ padding: 16 }}>
                      <Text strong>Right Panel</Text><br />
                      <Text type="secondary" style={{ fontSize: 12 }}>Resizable content</Text>
                    </div>
                  </Splitter.Panel>
                </Splitter>
              </CCard>
            </Section>

            {/* ═══════════════════════════════════════════════════════
                3. NAVIGATION
            ════════════════════════════════════════════════════════ */}
            <Section title="Navigation" id="nav">
              <CCard title="Anchor" num={12}>
                <Anchor
                  direction="horizontal"
                  items={[
                    { key: "c1",  href: "#c1",  title: "1 Button" },
                    { key: "c5",  href: "#c5",  title: "5 Divider" },
                    { key: "c12", href: "#c12", title: "12 Anchor" },
                    { key: "c19", href: "#c19", title: "19 AutoComplete" },
                    { key: "c37", href: "#c37", title: "37 Avatar" },
                    { key: "c57", href: "#c57", title: "57 Alert" },
                    { key: "c68", href: "#c68", title: "68 Affix" },
                  ]}
                />
                <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 8 }}>
                  The sticky bar at the top of this page is also an Anchor component.
                </Text>
              </CCard>

              <CCard title="Breadcrumb" num={13}>
                <Space orientation="vertical">
                  <Breadcrumb items={[{ title: <HomeOutlined /> }, { title: "Dashboard" }, { title: "Invoices" }, { title: "INV-001" }]} />
                  <Breadcrumb separator=">" items={[{ title: "Home" }, { title: "Settings" }, { title: "Profile" }]} />
                </Space>
              </CCard>

              <CCard title="Dropdown" num={14}>
                <Space>
                  <Dropdown menu={{ items: [{ key: "1", label: "View", icon: <EyeOutlined /> }, { key: "2", label: "Edit", icon: <EditOutlined /> }, { type: "divider" }, { key: "3", label: "Delete", icon: <DeleteOutlined />, danger: true }] }}>
                    <Button>Actions <DownOutlined /></Button>
                  </Dropdown>
                  <Dropdown menu={{ items: [{ key: "pdf", label: "Export PDF" }, { key: "csv", label: "Export CSV" }] }} placement="bottom">
                    <Button type="primary">Export <DownOutlined /></Button>
                  </Dropdown>
                </Space>
              </CCard>

              <CCard title="Menu" num={15}>
                <Menu mode="horizontal" defaultSelectedKeys={["dash"]} style={{ marginBottom: 12 }}
                  items={[
                    { key: "dash", label: "Dashboard", icon: <AppstoreOutlined /> },
                    { key: "invoices", label: "Invoices", icon: <FileOutlined /> },
                    { key: "clients", label: "Clients", icon: <UserOutlined /> },
                    { key: "settings", label: "Settings", icon: <SettingOutlined />, children: [{ key: "profile", label: "Profile" }, { key: "billing", label: "Billing" }] },
                  ]}
                />
                <Menu mode="inline" defaultSelectedKeys={["1"]} style={{ width: 220, border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  items={[
                    { key: "1", icon: <AppstoreOutlined />, label: "Overview" },
                    { key: "2", icon: <FileOutlined />, label: "Invoices", children: [{ key: "2a", label: "All" }, { key: "2b", label: "Draft" }, { key: "2c", label: "Sent" }] },
                    { key: "3", icon: <UserOutlined />, label: "Clients" },
                  ]}
                />
              </CCard>

              <CCard title="Pagination" num={16}>
                <Space orientation="vertical">
                  <Pagination defaultCurrent={3} total={100} />
                  <Pagination defaultCurrent={1} total={50} showSizeChanger showQuickJumper showTotal={(t) => `Total ${t} items`} />
                  <Pagination simple defaultCurrent={2} total={50} />
                </Space>
              </CCard>

              <CCard title="Steps" num={17}>
                <Space orientation="vertical" style={{ width: "100%" }}>
                  <Steps current={1} items={[{ title: "Create", content: "Fill details" }, { title: "Review", content: "Check all" }, { title: "Send", content: "Deliver" }, { title: "Paid", content: "Complete" }]} />
                  <Steps current={1} status="error" size="small" items={[{ title: "Created" }, { title: "Error", content: "Payment failed" }, { title: "Retry" }]} />
                  <Steps orientation="vertical" current={2} size="small"
                    items={[{ title: "Invoice Created", icon: <CheckCircleOutlined /> }, { title: "Sent to Client", icon: <MailOutlined /> }, { title: "Payment Received", icon: <ClockCircleOutlined /> }]}
                  />
                </Space>
              </CCard>

              <CCard title="Tabs" num={18}>
                <Tabs defaultActiveKey="1"
                  items={[
                    { key: "1", label: "Overview", children: <Paragraph style={{ margin: 0 }}>Overview of all invoices and payments.</Paragraph> },
                    { key: "2", label: "Invoices", children: <Paragraph style={{ margin: 0 }}>Invoice list and management.</Paragraph> },
                    { key: "3", label: "Reports", icon: <FileOutlined />, children: <Paragraph style={{ margin: 0 }}>Revenue reports and analytics.</Paragraph> },
                    { key: "4", label: "Settings", disabled: true, children: null },
                  ]}
                />
                <Tabs type="card" size="small" style={{ marginTop: 12 }} defaultActiveKey="a"
                  items={[
                    { key: "a", label: "Card Tab 1", children: <Text>Card-style tab content</Text> },
                    { key: "b", label: "Card Tab 2", children: <Text>Another card tab</Text> },
                  ]}
                />
              </CCard>
            </Section>

            {/* ═══════════════════════════════════════════════════════
                4. DATA ENTRY
            ════════════════════════════════════════════════════════ */}
            <Section title="Data Entry" id="entry">
              <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
                  <CCard title="AutoComplete" num={19}>
                    <AutoComplete style={{ width: "100%" }} placeholder="Type to search..."
                      options={[{ value: "Invoice #001 — Alice" }, { value: "Invoice #002 — Bob" }, { value: "Proposal — Carol" }]}
                    />
                  </CCard>
                  <CCard title="Cascader" num={20}>
                    <Cascader style={{ width: "100%" }} placeholder="Select location"
                      options={[
                        { value: "us", label: "United States", children: [{ value: "ny", label: "New York" }, { value: "ca", label: "California" }] },
                        { value: "uk", label: "United Kingdom", children: [{ value: "lon", label: "London" }, { value: "man", label: "Manchester" }] },
                        { value: "in", label: "India", children: [{ value: "mum", label: "Mumbai" }, { value: "del", label: "Delhi" }] },
                      ]}
                    />
                  </CCard>
                  <CCard title="Checkbox" num={21}>
                    <Space orientation="vertical">
                      <Checkbox>Basic checkbox</Checkbox>
                      <Checkbox defaultChecked>Checked by default</Checkbox>
                      <Checkbox indeterminate>Indeterminate</Checkbox>
                      <Checkbox disabled>Disabled</Checkbox>
                      <Divider style={{ margin: "8px 0" }} />
                      <Checkbox.Group options={["PDF", "Word", "Excel", "CSV"]} defaultValue={["PDF"]} />
                    </Space>
                  </CCard>
                  <CCard title="ColorPicker" num={22}>
                    <Space wrap>
                      <ColorPicker defaultValue="#1677ff" showText />
                      <ColorPicker defaultValue="#52c41a" showText format="rgb" />
                      <ColorPicker defaultValue="#722ed1" showText format="hsb" />
                      <ColorPicker presets={[{ label: "Brand", colors: ["#1677ff", "#52c41a", "#faad14", "#ff4d4f"] }]} showText />
                    </Space>
                  </CCard>
                  <CCard title="DatePicker" num={23}>
                    <Space orientation="vertical" style={{ width: "100%" }}>
                      <DatePicker style={{ width: "100%" }} placeholder="Pick a date" />
                      <DatePicker.RangePicker style={{ width: "100%" }} />
                      <DatePicker picker="month" style={{ width: "100%" }} />
                      <DatePicker picker="year" style={{ width: "100%" }} />
                      <DatePicker picker="week" style={{ width: "100%" }} />
                    </Space>
                  </CCard>
                  <CCard title="Form" num={24}>
                    <Form layout="vertical" size="small" style={{ maxWidth: 400 }}>
                      <Form.Item label="Client Name" name="name" rules={[{ required: true, message: "Required" }]}>
                        <Input placeholder="Enter client name" />
                      </Form.Item>
                      <Form.Item label="Amount" name="amount" rules={[{ type: "number", min: 0 }]}>
                        <InputNumber prefix="$" style={{ width: "100%" }} placeholder="0.00" />
                      </Form.Item>
                      <Form.Item label="Status" name="status">
                        <Select placeholder="Select status" options={[{ value: "draft", label: "Draft" }, { value: "sent", label: "Sent" }, { value: "paid", label: "Paid" }]} />
                      </Form.Item>
                      <Form.Item label="Notes" name="notes">
                        <Input.TextArea rows={2} placeholder="Additional notes..." />
                      </Form.Item>
                      <Form.Item>
                        <Space><Button type="primary" htmlType="submit">Submit</Button><Button htmlType="reset">Reset</Button></Space>
                      </Form.Item>
                    </Form>
                  </CCard>
                </Col>
                <Col xs={24} md={12}>
                  <CCard title="Input" num={25}>
                    <Space orientation="vertical" style={{ width: "100%" }}>
                      <Input placeholder="Basic input" />
                      <Input placeholder="With prefix" prefix={<UserOutlined />} />
                      <Input placeholder="With suffix" suffix={<SmileOutlined />} />
                      <Space.Compact style={{ width: "100%" }}>
                        <Input style={{ width: 36, textAlign: "center" }} defaultValue="$" readOnly />
                        <Input placeholder="Amount" />
                        <Input style={{ width: 48, textAlign: "center" }} defaultValue=".00" readOnly />
                      </Space.Compact>
                      <Input.Search placeholder="Search invoices..." enterButton="Search" />
                      <Input.Password placeholder="Password" />
                      <Input.TextArea rows={3} placeholder="Multi-line text area..." showCount maxLength={200} />
                      <Input.OTP length={6} />
                    </Space>
                  </CCard>
                  <CCard title="InputNumber" num={26}>
                    <Space orientation="vertical" style={{ width: "100%" }}>
                      <Space.Compact style={{ width: "100%" }}>
                        <Input style={{ width: 36, textAlign: "center" }} defaultValue="%" readOnly />
                        <InputNumber min={0} max={100} defaultValue={50} style={{ flex: 1, width: "100%" }} />
                      </Space.Compact>
                      <InputNumber prefix="$" defaultValue={1200} precision={2} style={{ width: "100%" }} />
                      <InputNumber defaultValue={75} formatter={(v) => `${v}%`} parser={(v) => Number(v?.replace("%", "")) as 75} style={{ width: "100%" }} />
                      <Space.Compact style={{ width: "100%" }}>
                        <Input style={{ width: 58, textAlign: "center" }} defaultValue="Month" readOnly />
                        <InputNumber min={1} max={12} defaultValue={6} style={{ flex: 1, width: "100%" }} />
                        <Input style={{ width: 62, textAlign: "center" }} defaultValue="of year" readOnly />
                      </Space.Compact>
                    </Space>
                  </CCard>
                  <CCard title="Mentions" num={27}>
                    <Mentions style={{ width: "100%" }} placeholder="@mention a team member"
                      options={[{ value: "alice", label: "Alice Johnson" }, { value: "bob", label: "Bob Smith" }, { value: "carol", label: "Carol White" }]}
                    />
                  </CCard>
                  <CCard title="Radio" num={28}>
                    <Space orientation="vertical">
                      <Radio.Group defaultValue="invoice">
                        <Radio value="invoice">Invoice</Radio>
                        <Radio value="proposal">Proposal</Radio>
                        <Radio value="contract">Contract</Radio>
                      </Radio.Group>
                      <Radio.Group defaultValue="a" optionType="button" buttonStyle="solid"
                        options={[{ label: "Draft", value: "a" }, { label: "Sent", value: "b" }, { label: "Paid", value: "c" }, { label: "Overdue", value: "d" }]}
                      />
                    </Space>
                  </CCard>
                  <CCard title="Rate" num={29}>
                    <Space orientation="vertical">
                      <Rate defaultValue={3} />
                      <Rate defaultValue={4.5} allowHalf />
                      <Rate character={<HeartOutlined />} defaultValue={3} style={{ color: "#eb2f96" }} />
                      <Rate character={({ index }) => <Text style={{ fontSize: 18 }}>{["😢", "😕", "😐", "😊", "😍"][index ?? 0]}</Text>} count={5} defaultValue={4} />
                    </Space>
                  </CCard>
                  <CCard title="Select" num={30}>
                    <Space orientation="vertical" style={{ width: "100%" }}>
                      <Select style={{ width: "100%" }} defaultValue="usd" options={[{ value: "usd", label: "🇺🇸 USD" }, { value: "eur", label: "🇪🇺 EUR" }, { value: "gbp", label: "🇬🇧 GBP" }, { value: "inr", label: "🇮🇳 INR" }]} />
                      <Select mode="multiple" style={{ width: "100%" }} placeholder="Select tags"
                        defaultValue={["invoice", "paid"]}
                        options={[{ value: "invoice", label: "Invoice" }, { value: "proposal", label: "Proposal" }, { value: "paid", label: "Paid" }, { value: "overdue", label: "Overdue" }]}
                      />
                      <Select mode="tags" style={{ width: "100%" }} placeholder="Add custom tags" />
                    </Space>
                  </CCard>
                </Col>
              </Row>

              <CCard title="Slider" num={31}>
                <Row gutter={32}>
                  <Col xs={24} md={12}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Basic</Text>
                    <Slider defaultValue={30} />
                    <Text type="secondary" style={{ fontSize: 12 }}>Range</Text>
                    <Slider range defaultValue={[20, 60]} />
                    <Text type="secondary" style={{ fontSize: 12 }}>With Marks</Text>
                    <Slider marks={{ 0: "0%", 25: "25%", 50: "50%", 75: "75%", 100: "100%" }} defaultValue={50} />
                  </Col>
                  <Col xs={24} md={12}>
                    <Flex gap={32} justify="center">
                      <div><Text type="secondary" style={{ fontSize: 12 }}>Vertical</Text><br /><Slider vertical defaultValue={60} style={{ height: 120 }} /></div>
                      <div><Text type="secondary" style={{ fontSize: 12 }}>Vertical Range</Text><br /><Slider vertical range defaultValue={[30, 70]} style={{ height: 120 }} /></div>
                    </Flex>
                  </Col>
                </Row>
              </CCard>

              <CCard title="Switch" num={32}>
                <Space wrap size="large">
                  <Switch defaultChecked />
                  <Switch />
                  <Switch checkedChildren="On" unCheckedChildren="Off" defaultChecked />
                  <Switch checkedChildren={<CheckCircleOutlined />} unCheckedChildren={<ClockCircleOutlined />} defaultChecked />
                  <Switch loading defaultChecked />
                  <Switch disabled defaultChecked />
                  <Switch size="small" defaultChecked />
                </Space>
              </CCard>

              <CCard title="TimePicker" num={33}>
                <Space>
                  <TimePicker defaultOpenValue={undefined} />
                  <TimePicker.RangePicker />
                  <TimePicker format="HH:mm" />
                  <TimePicker use12Hours format="h:mm a" />
                </Space>
              </CCard>

              <CCard title="Transfer" num={34}>
                <Transfer
                  dataSource={transferData}
                  targetKeys={transferKeys}
                  onChange={(keys) => setTransferKeys(keys as string[])}
                  render={(item) => item.title}
                  titles={["Available", "Selected"]}
                  showSearch
                />
              </CCard>

              <CCard title="TreeSelect" num={35}>
                <Space wrap>
                  <TreeSelect style={{ width: 240 }} placeholder="Select a category"
                    treeData={[
                      { title: "Invoices", value: "inv", children: [{ title: "Draft", value: "inv-draft" }, { title: "Sent", value: "inv-sent" }] },
                      { title: "Proposals", value: "prop", children: [{ title: "Pending", value: "prop-pending" }, { title: "Accepted", value: "prop-accepted" }] },
                    ]}
                  />
                  <TreeSelect style={{ width: 240 }} placeholder="Multi-select" treeCheckable multiple
                    treeData={[{ title: "All Documents", value: "all", children: [{ title: "Invoice", value: "inv2" }, { title: "Contract", value: "contract" }] }]}
                  />
                </Space>
              </CCard>

              <CCard title="Upload" num={36}>
                <Space align="start" wrap>
                  <Upload action="/api/upload" listType="text">
                    <Button icon={<UploadOutlined />}>Upload File</Button>
                  </Upload>
                  <Upload action="/api/upload" listType="picture">
                    <Button icon={<UploadOutlined />}>Upload Picture</Button>
                  </Upload>
                  <Upload action="/api/upload" listType="picture-card" maxCount={3}>
                    <div><PlusOutlined /><div style={{ marginTop: 8 }}>Upload</div></div>
                  </Upload>
                  <Upload.Dragger style={{ width: 240 }} action="/api/upload">
                    <p><InboxOutlined style={{ fontSize: 40, color: "#1677ff" }} /></p>
                    <p>Click or drag files here</p>
                    <p style={{ color: "#999", fontSize: 12 }}>Support PDF, Word, Excel</p>
                  </Upload.Dragger>
                </Space>
              </CCard>
            </Section>

            {/* ═══════════════════════════════════════════════════════
                5. DATA DISPLAY
            ════════════════════════════════════════════════════════ */}
            <Section title="Data Display" id="display">
              <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
                  <CCard title="Avatar" num={37}>
                    <Space orientation="vertical">
                      <Space>
                        <Avatar size={64} icon={<UserOutlined />} />
                        <Avatar size="large" style={{ background: "#f56a00" }}>U</Avatar>
                        <Avatar style={{ background: "#7265e6" }}>AL</Avatar>
                        <Avatar style={{ background: "#00a2ae" }} icon={<SmileOutlined />} />
                      </Space>
                      <Avatar.Group max={{ count: 3 }} size="large">
                        {["#1677ff", "#52c41a", "#faad14", "#ff4d4f", "#722ed1"].map((c, i) => (
                          <Avatar key={i} style={{ background: c }}>{String.fromCharCode(65 + i)}</Avatar>
                        ))}
                      </Avatar.Group>
                    </Space>
                  </CCard>
                  <CCard title="Badge" num={38}>
                    <Space size="large" wrap>
                      <Badge count={5}><Avatar shape="square" icon={<UserOutlined />} /></Badge>
                      <Badge count={99} overflowCount={99}><Avatar shape="square" icon={<BellOutlined />} /></Badge>
                      <Badge dot><Avatar shape="square" icon={<MailOutlined />} /></Badge>
                      <Badge count={0} showZero><Avatar shape="square" icon={<FileOutlined />} /></Badge>
                    </Space>
                    <Divider style={{ margin: "12px 0" }} />
                    <Space orientation="vertical">
                      <Badge status="success" text="Invoice Paid" />
                      <Badge status="processing" text="Processing Payment" />
                      <Badge status="error" text="Payment Failed" />
                      <Badge status="warning" text="Invoice Overdue" />
                      <Badge status="default" text="Draft" />
                      <Badge color="purple" text="Custom Color" />
                    </Space>
                  </CCard>
                  <CCard title="Segmented" num={39}>
                    <Space orientation="vertical">
                      <Segmented options={["Daily", "Weekly", "Monthly", "Yearly"]} defaultValue="Monthly" />
                      <Segmented block options={["Invoice", "Proposal", "Contract"]} defaultValue="Invoice" />
                      <Segmented options={[{ label: "List", value: "list", icon: <AppstoreOutlined /> }, { label: "Grid", value: "grid", icon: <AppstoreOutlined /> }]} />
                    </Space>
                  </CCard>
                  <CCard title="Statistic" num={40}>
                    <Row gutter={16}>
                      <Col span={12}><Statistic title="Total Revenue" value={112893.5} prefix="$" precision={2} styles={{ content: { color: "#52c41a" } }} /></Col>
                      <Col span={12}><Statistic title="Pending" value={12} suffix="invoices" styles={{ content: { color: "#faad14" } }} /></Col>
                      <Col span={12} style={{ marginTop: 16 }}><Statistic title="Overdue" value={3} styles={{ content: { color: "#ff4d4f" } }} /></Col>
                      <Col span={12} style={{ marginTop: 16 }}><Statistic title="This Month" value={68} suffix="%" styles={{ content: { color: "#1677ff" } }} /></Col>
                    </Row>
                  </CCard>
                </Col>
                <Col xs={24} md={12}>
                  <CCard title="Tag" num={41}>
                    <Space orientation="vertical">
                      <Space wrap>
                        <Tag>Default</Tag><Tag color="blue">Blue</Tag><Tag color="green">Green</Tag>
                        <Tag color="red">Red</Tag><Tag color="orange">Orange</Tag><Tag color="purple">Purple</Tag>
                        <Tag color="cyan">Cyan</Tag><Tag color="magenta">Magenta</Tag><Tag color="gold">Gold</Tag>
                        <Tag color="volcano">Volcano</Tag><Tag color="lime">Lime</Tag><Tag color="geekblue">Geek Blue</Tag>
                      </Space>
                      <Space wrap>
                        <Tag closable>Closable</Tag>
                        <Tag icon={<SmileOutlined />} color="cyan">With Icon</Tag>
                        <Tag icon={<CheckCircleOutlined />} color="success">Success</Tag>
                        <Tag icon={<ClockCircleOutlined />} color="processing">Processing</Tag>
                        <Tag variant="filled" color="blue">Filled</Tag>
                      </Space>
                    </Space>
                  </CCard>
                  <CCard title="Tooltip (42) & Popover (43)" num={42}>
                    <Space wrap size="large">
                      <Tooltip title="This is a tooltip — hover to see">
                        <Button>Tooltip</Button>
                      </Tooltip>
                      <Tooltip title="Top tooltip" placement="top"><Button>Top</Button></Tooltip>
                      <Tooltip title="Right tooltip" placement="right"><Button>Right</Button></Tooltip>
                      <Popover
                        title="Invoice #INV-001"
                        content={<Space orientation="vertical" style={{ width: 200 }}>
                          <Text>Client: Alice Johnson</Text>
                          <Text>Amount: <Text strong>$1,200.00</Text></Text>
                          <Tag color="green">Paid</Tag>
                        </Space>}
                      >
                        <Button type="primary">Popover Preview</Button>
                      </Popover>
                    </Space>
                  </CCard>
                  <CCard title="QRCode" num={44}>
                    <Space>
                      <QRCode value="https://cliently.app/invoice/001" size={100} />
                      <QRCode value="https://cliently.app/invoice/002" size={100} color="#1677ff" bgColor="#e6f4ff" />
                      <QRCode value="https://cliently.app" size={100} type="svg" />
                    </Space>
                  </CCard>
                  <CCard title="Empty" num={45}>
                    <Row gutter={8}>
                      <Col span={8}><Empty description="No data" /></Col>
                      <Col span={8}><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Empty" /></Col>
                      <Col span={8}><Empty description="No invoices" image={<FileOutlined style={{ fontSize: 40, color: "#ccc" }} />} /></Col>
                    </Row>
                  </CCard>
                </Col>
              </Row>

              <CCard title="Card" num={46}>
                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Card title="Invoice #001" extra={<Link>View</Link>} actions={[<EditOutlined key="edit" />, <EyeOutlined key="view" />, <DeleteOutlined key="delete" />]}>
                      <Statistic title="Amount" value={1200} prefix="$" styles={{ content: { fontSize: 20 } }} />
                      <Tag color="green" style={{ marginTop: 8 }}>Paid</Tag>
                    </Card>
                  </Col>
                  <Col xs={24} md={8}>
                    <Card hoverable cover={<div style={{ height: 100, background: "linear-gradient(135deg, #1677ff, #69b1ff)", display: "flex", alignItems: "center", justifyContent: "center" }}><FileOutlined style={{ fontSize: 40, color: "#fff" }} /></div>}>
                      <Card.Meta title="Proposal #PRO-005" description="Web redesign project · $3,500" />
                    </Card>
                  </Col>
                  <Col xs={24} md={8}>
                    <Card type="inner" title="Summary">
                      <p>Invoices: <Text strong>24</Text></p>
                      <p>Revenue: <Text strong type="success">$48,320</Text></p>
                      <p>Pending: <Text strong type="warning">$5,200</Text></p>
                    </Card>
                  </Col>
                </Row>
              </CCard>

              <CCard title="Carousel" num={47}>
                <Carousel autoplay style={{ background: "#001529", borderRadius: 8, overflow: "hidden" }}>
                  {[["Invoice Dashboard", "#1677ff"], ["Revenue Reports", "#52c41a"], ["Client Overview", "#722ed1"], ["Quick Actions", "#fa8c16"]].map(([title, color]) => (
                    <div key={title}><div style={{ height: 140, background: color as string, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Title level={3} style={{ color: "#fff", margin: 0 }}>{title as string}</Title>
                    </div></div>
                  ))}
                </Carousel>
              </CCard>

              <CCard title="Collapse" num={48}>
                <Collapse defaultActiveKey={["1"]}
                  items={[
                    { key: "1", label: "Invoice #INV-001 · Alice Johnson · $1,200", children: <Descriptions size="small" column={2}><Descriptions.Item label="Due">Apr 30, 2026</Descriptions.Item><Descriptions.Item label="Status"><Tag color="green">Paid</Tag></Descriptions.Item></Descriptions> },
                    { key: "2", label: "Invoice #INV-002 · Bob Smith · $850", children: <Descriptions size="small" column={2}><Descriptions.Item label="Due">May 15, 2026</Descriptions.Item><Descriptions.Item label="Status"><Tag color="orange">Pending</Tag></Descriptions.Item></Descriptions> },
                    { key: "3", label: "Invoice #INV-003 · Carol White · $2,100", extra: <Tag color="red">Overdue</Tag>, children: <Paragraph>Payment was due on Apr 1, 2026. Please follow up with the client.</Paragraph> },
                  ]}
                />
              </CCard>

              <CCard title="Descriptions" num={49}>
                <Descriptions title="Invoice Details" bordered column={3} extra={<Button size="small">Edit</Button>}>
                  <Descriptions.Item label="Invoice #">INV-20260409</Descriptions.Item>
                  <Descriptions.Item label="Client">Alice Johnson</Descriptions.Item>
                  <Descriptions.Item label="Status"><Tag color="green">Paid</Tag></Descriptions.Item>
                  <Descriptions.Item label="Amount">$1,200.00</Descriptions.Item>
                  <Descriptions.Item label="Created">Apr 9, 2026</Descriptions.Item>
                  <Descriptions.Item label="Due Date">Apr 30, 2026</Descriptions.Item>
                  <Descriptions.Item label="Notes" span={3}>Net 30 payment terms. Thank you for your business! Please contact support if you have any questions.</Descriptions.Item>
                </Descriptions>
              </CCard>

              <CCard title="Table" num={50}>
                <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 12 }} wrap>
                  <Space>
                    <Input.Search
                      placeholder="Search projects..."
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                      style={{ width: 220 }}
                      allowClear
                    />
                    <Select
                      value={projectStatus}
                      onChange={setProjectStatus}
                      style={{ width: 140 }}
                      options={[
                        { value: "all",         label: "All Status" },
                        { value: "planning",    label: "Planning" },
                        { value: "in_progress", label: "In Progress" },
                        { value: "review",      label: "Review" },
                        { value: "completed",   label: "Completed" },
                        { value: "on_hold",     label: "On Hold" },
                        { value: "cancelled",   label: "Cancelled" },
                      ]}
                    />
                  </Space>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {projectDemoData.filter(r =>
                      (projectStatus === "all" || r.status === projectStatus) &&
                      r.title.toLowerCase().includes(projectSearch.toLowerCase())
                    ).length} projects
                  </Text>
                </Space>
                <div className="user-table">
                  <Table<ProjectRow>
                    columns={[
                      {
                        title: "Project", dataIndex: "title", key: "title",
                        render: (v: string) => <Text strong style={{ color: "#5e5cc5" }}>{v}</Text>,
                      },
                      {
                        title: "Client", dataIndex: "client", key: "client",
                        render: (v: string) => <Text type="secondary">{v}</Text>,
                      },
                      {
                        title: "Status", dataIndex: "status", key: "status", align: "center" as const,
                        render: (s: string) => {
                          const map: Record<string, { color: string; label: string }> = {
                            planning:    { color: "blue",       label: "Planning" },
                            in_progress: { color: "processing", label: "In Progress" },
                            review:      { color: "orange",     label: "Review" },
                            completed:   { color: "green",      label: "Completed" },
                            on_hold:     { color: "default",    label: "On Hold" },
                            cancelled:   { color: "red",        label: "Cancelled" },
                          };
                          const { color, label } = map[s] ?? { color: "default", label: s };
                          return <Tag color={color}>{label}</Tag>;
                        },
                      },
                      {
                        title: "Deadline", dataIndex: "deadline", key: "deadline", align: "center" as const,
                        render: (v: string) => <Text type="secondary">{v}</Text>,
                      },
                      { title: "Budget", dataIndex: "budget", key: "budget", align: "right" as const },
                      {
                        title: "Action", key: "action", align: "center" as const, width: 120,
                        render: () => (
                          <Space>
                            <Button size="small" type="text" icon={<EyeOutlined />} style={{ color: "#1677ff" }} />
                            <Button size="small" type="text" icon={<EditOutlined />} style={{ color: "#fa8c16" }} />
                            <Button size="small" type="text" icon={<DeleteOutlined />} style={{ color: "#ff4d4f" }} />
                          </Space>
                        ),
                      },
                    ]}
                    dataSource={projectDemoData.filter(r =>
                      (projectStatus === "all" || r.status === projectStatus) &&
                      r.title.toLowerCase().includes(projectSearch.toLowerCase())
                    )}
                    rowKey="key"
                    bordered
                    size="small"
                    pagination={{
                      pageSize: 5,
                      showSizeChanger: false,
                      showTotal: (t) => `${t} projects`,
                      hideOnSinglePage: true,
                    }}
                    scroll={{ x: 700 }}
                  />
                </div>
              </CCard>

              <CCard title="List (custom — antd List deprecated in v6)" num={51}>
                <Space orientation="vertical" style={{ width: "100%" }}>
                  {[
                    { title: "Invoice #001 — Alice Johnson", desc: "$1,200 · Paid · Apr 30", status: "Paid" },
                    { title: "Invoice #002 — Bob Smith", desc: "$850 · Pending · May 15", status: "Pending" },
                    { title: "Invoice #003 — Carol White", desc: "$2,100 · Overdue · Apr 1", status: "Overdue" },
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", border: `1px solid hsl(var(--border))`, borderRadius: 8 }}>
                      <Avatar icon={<UserOutlined />} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Text strong style={{ display: "block", fontSize: 13 }}>{item.title}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>{item.desc}</Text>
                      </div>
                      <Tag color={{ Paid: "green", Pending: "orange", Overdue: "red" }[item.status as "Paid" | "Pending" | "Overdue"]}>{item.status}</Tag>
                    </div>
                  ))}
                </Space>
              </CCard>

              <CCard title="Timeline" num={52}>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Timeline items={[
                      { color: "green", content: "Invoice created — Apr 1, 2026" },
                      { color: "blue", content: "Email sent to client — Apr 2, 2026" },
                      { color: "blue", content: "Client opened invoice — Apr 3, 2026" },
                      { color: "green", icon: <CheckCircleOutlined style={{ fontSize: 16 }} />, content: "Payment received — Apr 15, 2026" },
                    ]} />
                  </Col>
                  <Col xs={24} md={12}>
                    <Timeline mode="alternate" items={[
                      { content: "Create", color: "green" },
                      { content: "Send", color: "blue", placement: "end" },
                      { content: "Review", color: "blue" },
                      { content: "Pay", color: "green", placement: "end" },
                    ]} />
                  </Col>
                </Row>
              </CCard>

              <CCard title="Tree" num={53}>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Tree treeData={treeData} defaultExpandAll showLine />
                  </Col>
                  <Col xs={24} md={12}>
                    <Tree treeData={treeData} checkable defaultExpandAll />
                  </Col>
                </Row>
              </CCard>

              <CCard title="Calendar" num={54}>
                <Calendar fullscreen={false} />
              </CCard>

              <CCard title="Image" num={55}>
                <Image.PreviewGroup>
                  <Space>
                    <Image width={100} height={80} style={{ objectFit: "cover" }} src="https://gw.alipayobjects.com/zos/antfincdn/LlvErxo8H9/photo-1503185912284-5271ff81b9a8.webp" alt="img1" />
                    <Image width={100} height={80} style={{ objectFit: "cover" }} src="https://gw.alipayobjects.com/zos/antfincdn/cV16ZqzMjW/photo-1473091540282-9b846e7965e3.webp" alt="img2" />
                    <Image width={100} height={80} style={{ objectFit: "cover" }} src="https://gw.alipayobjects.com/zos/antfincdn/x43I27A55%26/photo-1438109491414-7198515b166b.webp" alt="img3" />
                  </Space>
                </Image.PreviewGroup>
              </CCard>
            </Section>

            {/* ═══════════════════════════════════════════════════════
                6. FEEDBACK
            ════════════════════════════════════════════════════════ */}
            <Section title="Feedback" id="feedback">
              <CCard title="Tour" num={56}>
                <div ref={tourRef} style={{ display: "inline-block" }}>
                  <Button type="primary" onClick={() => setTourOpen(true)}>Start Product Tour</Button>
                </div>
                <Tour open={tourOpen} onClose={() => setTourOpen(false)}
                  steps={[
                    { title: "Welcome to Cliently", description: "This is your invoice management dashboard.", target: () => tourRef.current as HTMLElement },
                    { title: "Data Entry", description: "Use these forms to create invoices, proposals, and contracts." },
                    { title: "All Done!", description: "You've completed the tour. Start creating invoices now!" },
                  ]}
                />
              </CCard>

              <CCard title="Alert" num={57}>
                <Space orientation="vertical" style={{ width: "100%" }}>
                  <Alert title="Success — Invoice #001 sent to alice@example.com" type="success" showIcon />
                  <Alert title="Info — 3 invoices are due this week." type="info" showIcon />
                  <Alert title="Warning — Invoice #003 payment is 5 days overdue." type="warning" showIcon closable />
                  <Alert title="Error — Failed to send invoice." description="Check your SMTP configuration and ensure the client email is valid." type="error" showIcon closable />
                  <Alert title="Banner style" banner type="warning" />
                </Space>
              </CCard>

              <CCard title="Progress" num={58}>
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={16}>
                    <Space orientation="vertical" style={{ width: "100%" }}>
                      <Progress percent={75} />
                      <Progress percent={50} status="active" strokeColor={{ from: "#1677ff", to: "#52c41a" }} />
                      <Progress percent={30} status="exception" />
                      <Progress percent={100} />
                      <Progress steps={5} percent={60} />
                      <Progress steps={10} percent={80} strokeColor="#52c41a" />
                    </Space>
                  </Col>
                  <Col xs={24} md={8}>
                    <Space size="large">
                      <Progress type="circle" percent={88} />
                      <Progress type="dashboard" percent={72} gapDegree={75} />
                    </Space>
                  </Col>
                </Row>
              </CCard>

              <CCard title="Skeleton" num={59}>
                <Space orientation="vertical" style={{ width: "100%" }}>
                  <Skeleton avatar paragraph={{ rows: 2 }} />
                  <Divider style={{ margin: "8px 0" }} />
                  <Space>
                    <Skeleton.Button active />
                    <Skeleton.Input active />
                    <Skeleton.Avatar active />
                  </Space>
                  <Skeleton.Image active />
                </Space>
              </CCard>

              <CCard title="Spin" num={60}>
                <Space size="large" align="start" wrap>
                  <Space orientation="vertical" align="center"><Spin size="small" /><Text style={{ fontSize: 11 }}>small</Text></Space>
                  <Space orientation="vertical" align="center"><Spin /><Text style={{ fontSize: 11 }}>default</Text></Space>
                  <Space orientation="vertical" align="center"><Spin size="large" /><Text style={{ fontSize: 11 }}>large</Text></Space>
                  <Spin description="Loading invoices..." size="large">
                    <div style={{ padding: 24, background: "hsl(var(--muted))", borderRadius: 8, width: 200, textAlign: "center" }}>
                      <Text type="secondary">Content area</Text>
                    </div>
                  </Spin>
                </Space>
              </CCard>

              <CCard title="Result" num={61}>
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}><Result status="success" title="Invoice Sent!" subTitle="Delivered to alice@example.com" extra={[<Button type="primary" key="v">View Invoice</Button>]} /></Col>
                  <Col xs={24} md={12}><Result status="warning" title="Payment Overdue" subTitle="Invoice #003 was due Apr 1, 2026" extra={[<Button key="r">Send Reminder</Button>]} /></Col>
                  <Col xs={24} md={12}><Result status="error" title="Upload Failed" subTitle="File exceeds the 10MB limit" extra={[<Button key="retry" type="primary">Retry</Button>]} /></Col>
                  <Col xs={24} md={12}><Result status="info" title="Processing" subTitle="Your payment is being verified." extra={[<Button key="ok">OK</Button>]} /></Col>
                </Row>
              </CCard>

              <CCard title="Watermark" num={62}>
                <Watermark content="CONFIDENTIAL">
                  <div style={{ height: 120, background: "hsl(var(--muted))", border: "1px dashed hsl(var(--border))", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Text type="secondary">Document content protected by watermark</Text>
                  </div>
                </Watermark>
              </CCard>

              <CCard title="Modal (63) · Drawer (64) · Message (65) · Notification (66) · Popconfirm (67)" num={63}>
                <Space wrap>
                  <Button type="primary" onClick={() => setModalOpen(true)}>Open Modal</Button>
                  <Button onClick={() => setDrawerOpen(true)}>Open Drawer</Button>
                  <Button onClick={() => msgApi.success("Invoice sent successfully!")}>Message Success</Button>
                  <Button onClick={() => msgApi.warning("Payment overdue by 5 days!")}>Message Warning</Button>
                  <Button onClick={() => notifApi.info({ title: "New Invoice Created", description: "Invoice #INV-004 for Bob Smith · $850", placement: "topRight" })}>Notification</Button>
                  <Button onClick={() => notifApi.success({ title: "Payment Received", description: "$1,200 from Alice Johnson" })}>Notification Success</Button>
                  <Popconfirm title="Delete this invoice?" description="This action cannot be undone." onConfirm={() => msgApi.success("Invoice deleted.")} okText="Delete" okButtonProps={{ danger: true }}>
                    <Button danger>Delete with Confirm</Button>
                  </Popconfirm>
                </Space>

                <Modal title="Invoice #INV-001 Preview" open={modalOpen} onOk={() => setModalOpen(false)} onCancel={() => setModalOpen(false)} width={560}>
                  <Descriptions bordered size="small">
                    <Descriptions.Item label="Client" span={3}>Alice Johnson</Descriptions.Item>
                    <Descriptions.Item label="Amount">$1,200.00</Descriptions.Item>
                    <Descriptions.Item label="Status"><Tag color="green">Paid</Tag></Descriptions.Item>
                    <Descriptions.Item label="Due">Apr 30, 2026</Descriptions.Item>
                  </Descriptions>
                </Modal>

                <Drawer title="Invoice Details" open={drawerOpen} onClose={() => setDrawerOpen(false)} style={{ maxWidth: 380 }}
                  extra={<Space><Button onClick={() => setDrawerOpen(false)}>Cancel</Button><Button type="primary">Edit</Button></Space>}
                >
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="Invoice #">INV-20260409</Descriptions.Item>
                    <Descriptions.Item label="Client">Alice Johnson</Descriptions.Item>
                    <Descriptions.Item label="Amount">$1,200.00</Descriptions.Item>
                    <Descriptions.Item label="Due">Apr 30, 2026</Descriptions.Item>
                    <Descriptions.Item label="Status"><Tag color="green">Paid</Tag></Descriptions.Item>
                  </Descriptions>
                  <Divider />
                  <Timeline items={[{ color: "green", content: "Invoice created" }, { color: "blue", content: "Sent to client" }, { color: "green", content: "Payment received" }]} />
                </Drawer>
              </CCard>

            </Section>

            {/* ═══════════════════════════════════════════════════════
                7. OTHER
            ════════════════════════════════════════════════════════ */}
            <Section title="Other" id="other">
              <CCard title="Affix" num={68}>
                <Text type="secondary">The sticky navigation bar at the top of this page uses <Text code>{"<Affix offsetTop={0}>"}</Text> to pin the Anchor links. Scroll up to see it in action.</Text>
              </CCard>

              <CCard title="ConfigProvider — Theme Override" num={70}>
                <Space orientation="vertical" style={{ width: "100%" }}>
                  <ConfigProvider theme={{ token: { colorPrimary: "#52c41a", borderRadius: 2 } }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Green theme (flat)</Text>
                    <Space><Button type="primary">Submit</Button><Select defaultValue="a" options={[{ value: "a", label: "Option" }]} style={{ width: 140 }} /><Switch defaultChecked /></Space>
                  </ConfigProvider>
                  <ConfigProvider theme={{ token: { colorPrimary: "#722ed1", borderRadius: 12 } }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Purple theme (rounded)</Text>
                    <Space><Button type="primary">Submit</Button><Progress percent={70} style={{ width: 200 }} /><Rate defaultValue={4} /></Space>
                  </ConfigProvider>
                  <ConfigProvider theme={{ token: { colorPrimary: "#fa8c16" } }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Orange theme</Text>
                    <Space><Button type="primary">Submit</Button><Slider defaultValue={60} style={{ width: 200 }} /></Space>
                  </ConfigProvider>
                </Space>
              </CCard>

              <CCard title="App (context wrapper)" num={69}>
                <Alert title={<><Text code>{"<App>"}</Text> wraps this entire page, enabling <Text code>message.useMessage()</Text> and <Text code>notification.useNotification()</Text> hooks. Click the buttons in the Feedback section to see them in action.</>} type="info" showIcon />
              </CCard>

              <CCard title="Util — theme token access" num={71}>
                <ThemeTokenDisplay />
              </CCard>
            </Section>

            <Divider />
            <div style={{ textAlign: "center", padding: "24px 0 8px" }}>
              <Text type="secondary">Ant Design v6.3.5 · {Object.keys({ Button: 1, FloatButton: 1, Icon: 1, Typography: 1, Divider: 1, Flex: 1, Grid: 1, Layout: 1, Masonry: 1, Space: 1, Splitter: 1, Anchor: 1, Breadcrumb: 1, Dropdown: 1, Menu: 1, Pagination: 1, Steps: 1, Tabs: 1, AutoComplete: 1, Cascader: 1, Checkbox: 1, ColorPicker: 1, DatePicker: 1, Form: 1, Input: 1, InputNumber: 1, Mentions: 1, Radio: 1, Rate: 1, Select: 1, Slider: 1, Switch: 1, TimePicker: 1, Transfer: 1, TreeSelect: 1, Upload: 1, Avatar: 1, Badge: 1, Calendar: 1, Card: 1, Carousel: 1, Collapse: 1, Descriptions: 1, Empty: 1, Image: 1, List: 1, Popover: 1, QRCode: 1, Segmented: 1, Statistic: 1, Table: 1, Tag: 1, Timeline: 1, Tooltip: 1, Tour: 1, Tree: 1, Alert: 1, Drawer: 1, Message: 1, Modal: 1, Notification: 1, Popconfirm: 1, Progress: 1, Result: 1, Skeleton: 1, Spin: 1, Watermark: 1, Affix: 1, App: 1, ConfigProvider: 1 }).length} components showcased · Cliently Testing</Text>
            </div>
          </div>
        </div>
      </App>
    </ConfigProvider>
  );
}

function ThemeTokenDisplay() {
  const { token } = theme.useToken();
  return (
    <Space wrap>
      {(["colorPrimary", "colorSuccess", "colorWarning", "colorError", "colorInfo"] as const).map((key) => (
        <Tooltip key={key} title={`token.${key} = ${token[key]}`}>
          <div style={{ width: 48, height: 48, background: token[key], borderRadius: 8, cursor: "default" }} />
        </Tooltip>
      ))}
      <Text type="secondary" style={{ fontSize: 12 }}>Hover for token name · from ConfigProvider.useToken()</Text>
    </Space>
  );
}
