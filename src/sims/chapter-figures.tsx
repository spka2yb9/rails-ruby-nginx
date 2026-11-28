import { LoadingQueries, IndexPages } from './DatabaseFigures'
import { ExecutionFigure, MethodLookup } from './ExecutionFigures'
import { DependencyStability, DesignScenario, StructureComparison } from './DesignFigures'
import { RequestCapacity } from './RequestCapacity'

export function StudyFigures({ chapter, section }: { chapter: number; section: string }) {
  switch (`${chapter}/${section}`) {
    case '2/method-lookup': return <MethodLookup />
    case '3/extend': return <MethodLookup classMethods />
    case '6/middleware': return <ExecutionFigure id="rack" />
    case '7/boot-overview': return <ExecutionFigure id="boot" />
    case '8/naming': return <ExecutionFigure id="zeitwerk" />
    case '9/recognize': return <ExecutionFigure id="routing" />
    case '13/n-plus-one': return <LoadingQueries />
    case '14/callback-order': return <ExecutionFigure id="callbacks" />
    case '15/pool': return <RequestCapacity poolOnly />
    case '18/transaction': return <ExecutionFigure id="jobs" />
    case '22/rails-cache': return <ExecutionFigure id="cache" />
    case '25/timeouts': return <ExecutionFigure id="proxy" />
    case '37/index': return <IndexPages />
    case '47/rails-impl': return <DesignScenario id="state" />
    case '49/scene': return <DesignScenario id="unlocked" />
    case '49/rails-impl': return <DesignScenario id="locked" />
    case '51/job-queue': return <DesignScenario id="domain" />
    case '52/scene': return <DesignScenario id="double" />
    case '52/idea': return <DesignScenario id="keyed" />
    case '53/scene': return <DesignScenario id="outbox" />
    case '75/tradeoffs': return <DependencyStability />
    case '97/gc': return <ExecutionFigure id="gc" />
    case '98/gvl': return <ExecutionFigure id="gvl" />
    case '104/tcp': return <ExecutionFigure id="tcp" />
    case '113/capacity': return <RequestCapacity />
    case '40/idea':
    case '42/idea':
    case '43/idea':
    case '44/idea':
    case '48/idea':
    case '50/idea':
    case '55/sequence':
    case '67/tradeoffs':
    case '70/tradeoffs': return <StructureComparison chapter={chapter} />
    default: return null
  }
}
