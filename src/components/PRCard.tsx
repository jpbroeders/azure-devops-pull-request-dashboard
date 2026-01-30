import {
  Card,
  Avatar,
  Link,
  Badge,
  Tooltip,
  makeStyles,
  tokens,
  shorthands
} from '@fluentui/react-components'
import {
  CheckmarkCircle20Filled,
  DismissCircle20Filled,
  Clock20Regular,
  Circle20Regular,
  Branch20Regular,
  ArrowRight12Regular
} from '@fluentui/react-icons'
import type { PullRequest } from '../types'

const useStyles = makeStyles({
  card: {
    ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalL),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    backgroundColor: 'white',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
    cursor: 'pointer',
    ':hover': {
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
      transform: 'translateY(-2px)',
    },
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: tokens.spacingVerticalM,
  },
  projectBadge: {
    backgroundColor: '#f0f4ff',
    color: '#4361ee',
    fontWeight: '600',
    fontSize: '11px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  ageBadge: {
    backgroundColor: '#fff3e0',
    color: '#e65100',
  },
  staleBadge: {
    backgroundColor: '#ffebee',
    color: '#c62828',
  },
  title: {
    fontSize: '16px',
    fontWeight: '600',
    color: tokens.colorNeutralForeground1,
    marginBottom: tokens.spacingVerticalS,
    lineHeight: '1.4',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    ...shorthands.overflow('hidden'),
    textOverflow: 'ellipsis',
    textDecoration: 'none',
    ':hover': {
      color: '#4361ee',
    },
  },
  branchInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    color: tokens.colorNeutralForeground3,
    fontSize: '12px',
    marginBottom: tokens.spacingVerticalM,
    fontFamily: 'monospace',
  },
  branchName: {
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.padding('2px', '6px'),
    ...shorthands.borderRadius(tokens.borderRadiusSmall),
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: tokens.spacingVerticalM,
    ...shorthands.borderTop('1px', 'solid', tokens.colorNeutralStroke2),
  },
  author: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  authorName: {
    fontSize: '13px',
    color: tokens.colorNeutralForeground2,
    fontWeight: '500',
  },
  reviewers: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
  reviewerWrapper: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative' as const,
  },
  voteIcon: {
    position: 'absolute' as const,
    bottom: '-2px',
    right: '-4px',
    backgroundColor: 'white',
    ...shorthands.borderRadius('50%'),
  },
  repoName: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
  },
  needsYou: {
    ...shorthands.border('2px', 'solid', '#4361ee'),
    boxShadow: '0 0 0 2px rgba(67, 97, 238, 0.1)',
  },
})

function formatAge(dateString: string): { text: string; isStale: boolean } {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 7) return { text: `${diffDays}d`, isStale: true }
  if (diffDays > 0) return { text: `${diffDays}d`, isStale: diffDays > 3 }
  if (diffHours > 0) return { text: `${diffHours}h`, isStale: false }
  return { text: 'Now', isStale: false }
}

function getVoteIcon(vote: number) {
  switch (vote) {
    case 10: return <CheckmarkCircle20Filled style={{ color: '#107c10' }} />
    case 5: return <CheckmarkCircle20Filled style={{ color: '#498205' }} />
    case -5: return <Clock20Regular style={{ color: '#797673' }} />
    case -10: return <DismissCircle20Filled style={{ color: '#d13438' }} />
    default: return <Circle20Regular style={{ color: '#c8c6c4' }} />
  }
}

function getVoteLabel(vote: number): string {
  switch (vote) {
    case 10: return 'Approved'
    case 5: return 'Approved with suggestions'
    case -5: return 'Waiting for author'
    case -10: return 'Rejected'
    default: return 'No vote yet'
  }
}

interface Props {
  pr: PullRequest
  currentUserId: string
}

export function PRCard({ pr, currentUserId }: Props) {
  const styles = useStyles()
  const age = formatAge(pr.creationDate)
  const needsYourReview = pr.reviewers.some(r => r.id === currentUserId && r.vote === 0)

  return (
    <Card 
      className={`${styles.card} ${needsYourReview ? styles.needsYou : ''}`}
      onClick={() => window.open(pr.webUrl, '_blank')}
    >
      <div className={styles.header}>
        <Badge appearance="filled" className={styles.projectBadge}>
          {pr.repository.project.name}
        </Badge>
        <Badge 
          appearance="filled" 
          className={age.isStale ? styles.staleBadge : styles.ageBadge}
        >
          {age.text}
        </Badge>
      </div>

      <Link 
        href={pr.webUrl} 
        target="_blank" 
        className={styles.title}
        onClick={(e) => e.stopPropagation()}
      >
        {pr.title}
      </Link>

      <div className={styles.branchInfo}>
        <Branch20Regular />
        <span className={styles.branchName}>{pr.sourceRefName}</span>
        <ArrowRight12Regular />
        <span className={styles.branchName}>{pr.targetRefName}</span>
      </div>

      <div className={styles.repoName}>{pr.repository.name}</div>

      <div className={styles.footer}>
        <div className={styles.author}>
          <Avatar
            name={pr.createdBy.displayName}
            image={{ src: pr.createdBy.imageUrl }}
            size={28}
            color="colorful"
          />
          <span className={styles.authorName}>{pr.createdBy.displayName}</span>
        </div>

        <div className={styles.reviewers}>
          {pr.reviewers.slice(0, 4).map(reviewer => (
            <Tooltip
              key={reviewer.id}
              content={`${reviewer.displayName}: ${getVoteLabel(reviewer.vote)}`}
              relationship="label"
            >
              <div className={styles.reviewerWrapper}>
                <Avatar
                  name={reviewer.displayName}
                  image={{ src: reviewer.imageUrl }}
                  size={24}
                  color={reviewer.id === currentUserId ? 'brand' : 'colorful'}
                />
                <span className={styles.voteIcon}>
                  {getVoteIcon(reviewer.vote)}
                </span>
              </div>
            </Tooltip>
          ))}
          {pr.reviewers.length > 4 && (
            <Badge appearance="tint" size="small">+{pr.reviewers.length - 4}</Badge>
          )}
        </div>
      </div>
    </Card>
  )
}
