/**
 * Barrel for reusable primitives.
 *
 * Feature code imports from `@/components/common` so it never reaches into
 * individual primitive files, and swapping a primitive implementation stays
 * a one-file change.
 */
export { Badge, ConfidenceBadge, MetaChip, PriorityBadge, SensorBadge, StatusBadge } from './Badge'
export { Button, IconButton } from './Button'
export { Card, DataPair, MetricCard, MetricGrid } from './Card'
export { EmptyState } from './EmptyState'
export { ErrorState } from './ErrorState'
export { Input, Select } from './Input'
export { LoadingState } from './LoadingState'
export { ResourceState } from './ResourceState'
export { SectionHeader } from './SectionHeader'