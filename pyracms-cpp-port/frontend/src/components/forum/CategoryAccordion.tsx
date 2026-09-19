'use client'

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@mui/material'
import { ExpandMoreOutlined } from '@mui/icons-material'
import { ForumCard } from './ForumCard'
import { CategoryAdminBar, ForumAdminBar } from './ForumAdminBars'
import type { ForumAdminState } from '@/hooks/useForumAdmin'
import type { ForumCategory } from '@/hooks/useForumCategories'

interface CategoryAccordionProps {
  category: ForumCategory
  slug: string
  admin?: ForumAdminState | undefined
}

export function CategoryAccordion({
  category,
  slug,
  admin,
}: CategoryAccordionProps) {
  return (
    <Accordion
      defaultExpanded
      variant="outlined"
      sx={{
        mb: 2,
        borderColor: 'divider',
        '&:before': { display: 'none' },
      }}
      data-testid={`category-accordion-${category.id}`}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreOutlined />}
        sx={{ bgcolor: 'background.default' }}
        aria-label={`Toggle ${category.name} category`}
      >
        <Typography variant="h5" component="h2">
          {category.name}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        {admin && <CategoryAdminBar category={category} admin={admin} />}
        {category.forums.map((forum, index) => (
          <div key={forum.id}>
            <ForumCard
              forum={forum}
              slug={slug}
              isFirst={index === 0}
              isLast={index === category.forums.length - 1}
            />
            {admin && <ForumAdminBar forum={forum} admin={admin} />}
          </div>
        ))}
      </AccordionDetails>
    </Accordion>
  )
}
