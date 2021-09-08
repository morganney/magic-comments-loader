import('react-leaflet')
import { useEffect } from 'react'
import { Redirect, Route, Router } from 'react-router-dom'

/* import('./routes/BudgetRoutes') */

// import('react-leaflet')
// import('something-else')

import LazyRoute from './components/LazyRoute'

  /**
   * import('./routes/AdminRoutes')
   */

  /*
    blah
    import('/should/not/break')

    with other text
      */

const Routes = () => {
  useEffect(() => {
    const loadLocales = async () => {
      const mod = await import(`../../locales/${languages}`)
    }
    import('react-redux').then((mod) => {
      console.log(mod)
    })
    loadLocales()
  })

  return (
    <Router history={browserHistory}>
      <Route path="/index">
        <Redirect to="/" />
      </Route>

      <LazyRoute
        path="/admin"
        component={() =>
          import(/* webpackChunkName: "admin" */ './containers/admin/AdminRoutes')}
      />
      <LazyRoute
        path="/assessments"
        component={() =>
          import(
            /* webpackChunkName: "assessments" */ './containers/assessment/AssessmentListing'
          )}
      />
      <LazyRoute
        path="/budget"
        component={() =>
          import('./containers/budget/BudgetRoutes')}
      />
      <LazyRoute
        path="/cap"
        component={() =>
          import('./containers/cap/CapRoutes')}
      />
      <LazyRoute
        path="/clusters"
        component={() =>
          import(
            /* webpackChunkName: "clusters" */ './containers/clusters/ClusterRoutes'
          )}
      />
      <LazyRoute
        path="/employers"
        component={() =>
          import(
            /* webpackChunkName: "employers" */ './containers/employers/EmployerPortal'
          )}
      />
      <LazyRoute
        path="/explore"
        component={() =>
          import(/* webpackChunkName: "explore" */ './containers/ExploreListing')}
      />
      <LazyRoute
        path="/ip"
        component={() =>
          import(
            './containers/assessment/ip/InterestProfilerRoutes'
          )}
      />
      <LazyRoute
        path="/industry"
        component={() =>
          import(
            /* webpackChunkName: "industry" */ './containers/industry/IndustryRoutes'
          )}
      />
      <LazyRoute
        path="/internal"
        component={() =>
          import(
            './containers/internal/InternalRoutes'
          )}
      />
    </Router>
  )
}
