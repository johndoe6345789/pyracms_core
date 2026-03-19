'use client'

import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material'
import { ExpandMoreOutlined } from '@mui/icons-material'
import { ForumCard } from './ForumCard'
import type { ForumCategory } from '@/hooks/useForumCategories'

interface CategoryAccordionProps {
  category: ForumCategory
  slug: string
}

export function CategoryAccordion({ category, slug }: CategoryAccordionProps) {
  return (
    <Accordion
      defaultExpanded
      variant="outlined"
      sx={{ mb: 2, borderColor: 'divider', '&:before': { display: 'none' } }}
    >
      <AccordionSummary expandIcon={<ExpandMoreOutlined />} sx={{ bgcolor: 'background.default' }}>
        <Typography variant="h5" component="h2">{category.name}</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        {category.forums.map((forum, index) => (
          <ForumCard
            key={forum.id}
            forum={forum}
            slug={slug}
            isFirst={index === 0}
            isLast={index === category.forums.length - 1}
          />
        ))}
      </AccordionDetails>
    </Accordion>
  )
}
