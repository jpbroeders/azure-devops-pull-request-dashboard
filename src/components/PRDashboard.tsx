import { useState, useMemo } from 'react'
import {
  Tab,
  TabList,
  Button,
  Badge,
  Dropdown,
  Option,
  Card,
  Spinner,
  makeStyles,
  tokens,
  shorthands
} from '@fluentui/react-components'
import {
  ArrowClockwise24Regular,
  Code24Regular,
  PersonFeedback24Regular,
  Grid24Regular
} from '@fluentui/react-icons'
import { PRCard } from './PRCard'
import type { PullRequest, TabValue } from '../types'
import type { Project } from '../services/azureDevOps'
import { VERSION } from '../version'

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXL,
  },
  headerCard: {
    ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalXL),
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    ...shorthands.borderRadius(tokens.borderRadiusXLarge),
    boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: tokens.spacingVerticalM,
  },
  titleSection: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalL,
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: 'white',
    letterSpacing: '-0.5px',
  },
  totalBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    ...shorthands.padding('6px', '14px'),
    ...shorthands.borderRadius(tokens.borderRadiusCircular),
    fontSize: '14px',
    fontWeight: '600',
    backdropFilter: 'blur(10px)',
  },
  loadingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    ...shorthands.padding('6px', '14px'),
    ...shorthands.borderRadius(tokens.borderRadiusCircular),
    fontSize: '13px',
  },
  filters: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    alignItems: 'center',
  },
  refreshButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: 'white',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
    },
  },
  tabsCard: {
    ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalM),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    backgroundColor: 'white',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
  },
  tabList: {
    gap: tokens.spacingHorizontalS,
  },
  tab: {
    ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalL),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    fontWeight: '500',
  },
  badge: {
    marginLeft: tokens.spacingHorizontalS,
  },
  prGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: tokens.spacingVerticalL,
  },
  emptyState: {
    ...shorthands.padding(tokens.spacingVerticalXXL),
    textAlign: 'center' as const,
    color: tokens.colorNeutralForeground3,
    backgroundColor: 'white',
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: tokens.spacingVerticalM,
    opacity: 0.5,
  },
  errorBox: {
    ...shorthands.padding(tokens.spacingVerticalL),
    backgroundColor: '#fef2f2',
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    color: '#dc2626',
    textAlign: 'center' as const,
  },
  footer: {
    ...shorthands.padding(tokens.spacingVerticalM),
    textAlign: 'center' as const,
    color: tokens.colorNeutralForeground4,
    fontSize: '12px',
    marginTop: tokens.spacingVerticalL,
  },
})

interface Props {
  pullRequests: PullRequest[]
  currentUserId: string
  onRefresh: () => void
  isLoading?: boolean
  error?: string | null
  projects: Project[]
  selectedProject: Project | null
  onProjectChange: (project: Project | null) => void
}

export function PRDashboard({
  pullRequests,
  currentUserId,
  onRefresh,
  isLoading,
  error,
  projects,
  selectedProject,
  onProjectChange
}: Props) {
  const styles = useStyles()
  const [activeTab, setActiveTab] = useState<TabValue>('needs-review')

  const filteredPRs = useMemo(() => {
    switch (activeTab) {
      case 'needs-review':
        return pullRequests.filter(pr =>
          pr.reviewers.some(r => r.id === currentUserId && r.vote === 0)
        )
      case 'created-by-me':
        return pullRequests.filter(pr => pr.createdBy.id === currentUserId)
      case 'all':
      default:
        return pullRequests
    }
  }, [pullRequests, activeTab, currentUserId])

  const counts = useMemo(() => ({
    needsReview: pullRequests.filter(pr =>
      pr.reviewers.some(r => r.id === currentUserId && r.vote === 0)
    ).length,
    createdByMe: pullRequests.filter(pr => pr.createdBy.id === currentUserId).length,
    all: pullRequests.length
  }), [pullRequests, currentUserId])

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerCard}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <span className={styles.title}>Pull Request Dashboard</span>
            <span className={styles.totalBadge}>{pullRequests.length} Pull Requests</span>
            {isLoading && (
              <span className={styles.loadingIndicator}>
                <Spinner size="tiny" appearance="inverted" />
                Loading...
              </span>
            )}
          </div>
          <div className={styles.filters}>
            <Dropdown
              placeholder="Select project"
              value={selectedProject?.name || 'All projects'}
              onOptionSelect={(_, data) => {
                if (data.optionValue === 'all') {
                  onProjectChange(null)
                } else {
                  const project = projects.find(p => p.id === data.optionValue)
                  onProjectChange(project || null)
                }
              }}
              style={{ minWidth: '280px' }}
            >
              <Option value="all">All projects</Option>
              {projects.map(p => (
                <Option key={p.id} value={p.id}>{p.name}</Option>
              ))}
            </Dropdown>
            <Button
              icon={<ArrowClockwise24Regular />}
              appearance="subtle"
              className={styles.refreshButton}
              onClick={onRefresh}
              disabled={isLoading}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className={styles.errorBox}>
          <p><strong>Error:</strong> {error}</p>
          <Button onClick={onRefresh} style={{ marginTop: 8 }}>Retry</Button>
        </div>
      )}

      {/* Tabs */}
      <Card className={styles.tabsCard}>
        <TabList
          className={styles.tabList}
          selectedValue={activeTab}
          onTabSelect={(_, data) => setActiveTab(data.value as TabValue)}
        >
          <Tab value="needs-review" icon={<PersonFeedback24Regular />} className={styles.tab}>
            Needs My Review
            <Badge className={styles.badge} appearance="filled" color="danger">{counts.needsReview}</Badge>
          </Tab>
          <Tab value="created-by-me" icon={<Code24Regular />} className={styles.tab}>
            Created by Me
            <Badge className={styles.badge} appearance="filled" color="brand">{counts.createdByMe}</Badge>
          </Tab>
          <Tab value="all" icon={<Grid24Regular />} className={styles.tab}>
            All PRs
            <Badge className={styles.badge} appearance="tint">{counts.all}</Badge>
          </Tab>
        </TabList>
      </Card>

      {/* PR Grid */}
      {filteredPRs.length === 0 && !isLoading ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📭</div>
          <p>No pull requests found</p>
        </div>
      ) : (
        <div className={styles.prGrid}>
          {filteredPRs.map(pr => (
            <PRCard
              key={`${pr.repository.id}-${pr.id}`}
              pr={pr}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}

      {/* Footer */}
      <footer className={styles.footer}>
        Pull Request Dashboard v{VERSION}
      </footer>
    </div>
  )
}
