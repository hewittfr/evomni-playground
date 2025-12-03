import React from 'react'
import { Provider } from 'react-redux'
import { store } from './store'
import Layout from './components/Layout'
import { Routes, Route, HashRouter } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Evms from './pages/Evms'
import Evfc from './pages/Evfc'
import Evcsa from './pages/Evcsa'
import Evbf from './pages/Evbf'
import Evutil from './pages/Evutil'
import Ava from './pages/Ava'
import About from './pages/About'
import Feedback from './pages/Feedback'
import ProjectDetails from './pages/ProjectDetails'
import Users from './pages/admin/Users'
import Roles from './pages/admin/Roles'
import Permissions from './pages/admin/Permissions'
import Apps from './pages/admin/Apps'
import EmailDistributionGroups from './pages/admin/EmailDistributionGroups'

export default function App(){
  return (
    <Provider store={store}>
      <HashRouter>
        <Layout>
          <Routes>
          <Route path="/" element={<Dashboard/>} />
          <Route path="/evms" element={<Evms/>} />
          <Route path="/evfc" element={<Evfc/>} />
          <Route path="/evcsa" element={<Evcsa/>} />
          <Route path="/evbf" element={<Evbf/>} />
          <Route path="/evutil" element={<Evutil/>} />
          <Route path="/ava" element={<Ava/>} />
          <Route path="/about" element={<About/>} />
          <Route path="/feedback" element={<Feedback/>} />

          {/* admin nested routes */}
          <Route path="/admin/users" element={<Users/>} />
          <Route path="/admin/roles" element={<Roles/>} />
          <Route path="/admin/permissions" element={<Permissions/>} />
          <Route path="/admin/apps" element={<Apps/>} />
          <Route path="/admin/email-distribution-groups" element={<EmailDistributionGroups/>} />
          <Route path="/projects/:id" element={<ProjectDetails/>} />
          </Routes>
        </Layout>
      </HashRouter>
    </Provider>
  )
}
