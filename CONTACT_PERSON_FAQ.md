# Contact Person System - FAQ

Frequently asked questions about the Contact Person feature implementation.

---

## 🤔 General Concepts

### Q1: Why do we need a Contact Person system?
**A:** The Contact Person system solves several key problems:
- **Communication Structure:** Provides clear communication channels between companies
- **Privacy:** Prevents upstream companies from seeing internal team dynamics of subcontractors
- **Autonomy:** Allows subcontractors to manage their own teams independently
- **Scalability:** Enables unlimited levels of subcontracting without chaos
- **Accountability:** Clear single point of contact for each company

### Q2: What happens if someone isn't designated as a Contact Person?
**A:** Regular team members have limited permissions:
- Can see only their own company's team members
- Cannot invite external users or add team members
- Can assign tasks only to visible users
- Get visibility to upstream members and task-related users as needed

### Q3: Can a company have multiple contact persons on the same project?
**A:** No. Each company can have only ONE contact person per project. This ensures:
- Clear responsibility
- No confusion about who can invite/manage
- Single point of contact for communication

However, the same company can have different contact persons on different projects.

### Q4: What's the difference between "Owner" and "Contact Person"?
**A:** 
- **Project Owner:** The company that created/owns the project (stored in `projects.company_id`)
- **Contact Person:** The designated representative of ANY company (including owner) on a project

The project creator is automatically the contact person for the owner company.

---

## 👥 Visibility & Privacy

### Q5: Why can't upstream companies see downstream team members?
**A:** This is intentional for several reasons:
1. **Privacy:** Subcontractor's internal team structure is their business
2. **Simplicity:** Owner doesn't need to know about sub-sub-subcontractors
3. **Autonomy:** Subcontractor can reorganize their team without affecting upstream
4. **Professional Boundaries:** Maintains proper business relationships

**Example:** If General Contractor hires Electrical Company, and Electrical Company hires Wire Specialists, the General Contractor only needs to communicate with Electrical Company's contact person, not the wire specialists' individual workers.

### Q6: What if I need to see someone from a downstream subcontractor?
**A:** Visibility is automatically granted when there's a task relationship:
- If they assign you a task → you can see them
- If you assign them a task → you can see them

This ensures you can always communicate about specific work without seeing the entire team structure.

### Q7: Can admins see everyone?
**A:** Yes, system administrators bypass visibility restrictions for:
- System maintenance
- Troubleshooting
- Audit purposes
- Emergency situations

---

## 🔄 Contact Person Operations

### Q8: How do I become a Contact Person?
**A:** You become a contact person in one of these ways:
1. **Create a project** → Automatically become contact person for your company
2. **Be invited as contact person** → Person inviting you checks "Designate as Contact Person"
3. **Have it transferred to you** → Current contact person transfers the role to you

### Q9: Can I stop being a Contact Person?
**A:** Yes, but you must first:
1. Go to Project Settings
2. Select "Transfer Contact Person Role"
3. Choose another team member from your company
4. Confirm the transfer

You cannot simply leave the project while being a contact person.

### Q10: What if the Contact Person leaves the company (in real life)?
**A:** Before they leave, they should:
1. Transfer the contact person role to a colleague
2. Then remove themselves from the project

If they're deleted without transferring:
- System prevents user deletion if they're a contact person
- Admin must manually transfer the role first
- Alternatively, system can auto-promote the most senior user from that company

### Q11: Can a Contact Person assign tasks to their own team members?
**A:** Yes, absolutely! Contact persons can:
- Assign tasks to their own team members
- Assign tasks to subcontractor contact persons
- Assign tasks back to upstream members (escalate)

### Q12: Can a Contact Person remove team members?
**A:** Yes, contact persons can remove team members from their own company. However:
- Cannot remove themselves if they're the contact person (must transfer first)
- Cannot remove members from other companies
- Admin can override this

---

## 📨 Invitations

### Q13: Who can invite people to a project?
**A:** Only:
1. **Contact Persons** - Can invite subcontractors and add team members
2. **System Admins** - Can invite anyone

Regular team members cannot invite people.

### Q14: What's the difference between "Add Team Member" and "Invite Subcontractor"?
**A:**

**Add Team Member:**
- Adds users from YOUR company
- Users must already be registered in the system
- They get added immediately (no invitation needed)
- They join as regular team members

**Invite Subcontractor:**
- Invites users from EXTERNAL companies
- Can invite by email/phone (don't need to be registered)
- They receive an invitation to accept/decline
- You can designate them as contact person for their company

### Q15: Can I invite multiple people from the same external company?
**A:** Yes, but the process is:
1. First, invite one person and designate them as Contact Person
2. Once they accept and join, THEY can add their own team members
3. This maintains the proper hierarchy and autonomy

Alternatively, you can send multiple invitations and designate one as the contact person.

### Q16: What happens if an invitation expires?
**A:** Invitations expire after 7 days by default. After expiration:
- The invitee can no longer accept it
- You can resend the invitation
- The system marks it as "expired" but keeps the record for audit

---

## 🏗️ Company Hierarchy

### Q17: How many levels of subcontractors can I have?
**A:** There's no hard limit. The system supports unlimited levels:
```
Owner → Sub 1 → Sub 1.1 → Sub 1.1.1 → Sub 1.1.1.1 → ...
```

However, for practical purposes, 3-4 levels is typical in construction projects.

### Q18: Can a subcontractor work for multiple companies on the same project?
**A:** No. Each company has ONE parent company per project. This prevents:
- Circular dependencies
- Confusion about reporting structure
- Conflicting instructions

However, a company can be on multiple projects with different relationships.

### Q19: What if Company A is the owner on Project 1, but a subcontractor on Project 2?
**A:** That's perfectly fine! Company relationships are **per-project**:

**Project 1:**
```
Company A (Owner) → Company B (Subcontractor)
```

**Project 2:**
```
Company B (Owner) → Company A (Subcontractor)
```

Each project has its own hierarchy.

### Q20: Can I see the full company hierarchy for a project?
**A:** Yes! There will be a "Company Hierarchy" view showing:
- Tree structure of all companies
- Contact person for each company
- Your position in the hierarchy
- Number of team members (but not their names for downstream companies)

---

## 📋 Tasks & Assignments

### Q21: Can I assign a task to multiple people from different companies?
**A:** Yes, but with restrictions:
- You can assign to multiple people you can see
- Typically: your team members + subcontractor contact persons
- Cannot assign to people you don't have visibility to

**Best Practice:** Assign main task to subcontractor contact person, let them delegate to their team.

### Q22: If I delegate a task to my subcontractor, can the project owner see the delegation?
**A:** No. The project owner sees:
- Original task assigned to you
- Task status (in progress, completed, etc.)

They do NOT see:
- Sub-tasks you created
- Who you delegated to
- Your internal team's work breakdown

This preserves your autonomy in managing the work.

### Q23: Can I reject a task assigned by the project owner?
**A:** Yes, you can reject tasks with a reason. This is useful if:
- The work is outside your scope
- You don't have capacity
- Requirements are unclear

The task owner will be notified and can reassign or clarify.

### Q24: Can downstream subcontractors see the original task from the owner?
**A:** No. They only see the tasks assigned directly to them. Example:

```
Owner assigns Task A to Contact Person of Company B
→ Company B Contact creates Task B and assigns to Contact Person of Company C
→ Company C only sees Task B, not Task A
```

This maintains privacy and appropriate information flow.

---

## 🔐 Security & Permissions

### Q25: How is visibility enforced?
**A:** Visibility is enforced at multiple levels:
1. **Database Level:** Row Level Security (RLS) policies
2. **Backend Level:** Visibility functions check relationships
3. **UI Level:** Filtered user lists and dropdowns
4. **API Level:** Validation before any action

This makes it virtually impossible to bypass visibility rules.

### Q26: Can someone hack the system to see hidden users?
**A:** No. Visibility is enforced at the database level using PostgreSQL RLS:
- Even if someone bypasses the app, database won't return hidden users
- All queries automatically filter based on relationships
- Direct database access still respects RLS policies

### Q27: What permissions does a Contact Person have?
**A:** Contact persons can:
- ✅ Add/remove team members from own company
- ✅ Invite subcontractor companies
- ✅ Assign tasks to team or subcontractors
- ✅ Transfer contact person role
- ✅ View company hierarchy
- ✅ See all members of their level and upstream

Contact persons CANNOT:
- ❌ Remove other companies from project
- ❌ Change project owner
- ❌ See downstream subcontractor teams
- ❌ Modify other companies' settings

---

## 🛠️ Technical Questions

### Q28: How does this affect performance?
**A:** The implementation is optimized for performance:
- **Indexed queries:** All relationship lookups use database indexes
- **Cached results:** Visibility rules can be cached per user/project
- **Lazy loading:** User lists loaded on-demand
- **Efficient queries:** Recursive CTEs for hierarchy traversal

Expected performance:
- User visibility lookup: < 50ms
- Company hierarchy: < 100ms
- Works well with 100+ companies per project

### Q29: What database changes are required?
**A:** New tables:
- `company_project_relationships` - Company hierarchy
- `project_invitations` - Enhanced invitations

Modified tables:
- `user_project_roles` - Add `is_contact_person` flag

New functions:
- 5 helper functions for visibility and assignment rules

### Q30: Is this backward compatible with existing projects?
**A:** Yes! There's a migration script that:
1. Creates company relationships for all existing projects
2. Sets project creators as contact persons
3. Infers subcontractor relationships from current assignments
4. Preserves all existing data

Existing functionality continues to work, new features are additive.

---

## 🎯 Use Cases

### Q31: Our subcontractor wants to use their own workers. How does this work?
**Scenario:** General Contractor hires Electrical Company. Electrical Company wants to bring their team of 5 electricians.

**Solution:**
1. General Contractor invites Electrical Company's project manager as Contact Person
2. Project manager accepts invitation
3. Project manager adds their 5 electricians to the project
4. General Contractor only sees the project manager (contact person)
5. Project manager assigns electrical tasks to their team

**Result:** Clean hierarchy, General Contractor isn't overwhelmed with details.

### Q32: What if a subcontractor needs to hire their own subcontractor?
**Scenario:** Owner → General Contractor → HVAC Company → Duct Fabricator

**Solution:**
1. Owner invites General Contractor (as contact person)
2. General Contractor invites HVAC Company (as contact person)
3. HVAC Company invites Duct Fabricator (as contact person)
4. Each level manages their own relationships

**Visibility:**
- Owner sees: Owner team + General Contractor contact
- General Contractor sees: Owner team + GC team + HVAC contact
- HVAC sees: Owner + GC teams + HVAC team + Duct Fabricator contact
- Duct Fabricator sees: Owner + GC + HVAC + Fabricator teams

### Q33: Can we use this for consultants (architects, engineers)?
**A:** Yes! Consultants can be invited as:
- Contact Person for their firm
- Assigned appropriate roles (architect, engineer, inspector)
- Given visibility to relevant teams

They work the same way as subcontractors in the hierarchy.

### Q34: What about suppliers who just deliver materials?
**A:** Suppliers can be added with minimal involvement:
- Invite as contact person (optional)
- Assign material delivery tasks
- They may not need a full team on the project
- Can be marked as "supplier" company type

---

## 🐛 Troubleshooting

### Q35: I can't see a user I need to assign a task to. Why?
**Possible reasons:**
1. They're not on this project → Ask your contact person to add them
2. They're in a downstream company → You should only see their contact person
3. You're not the contact person → You can only see your own team
4. They were removed from the project → Check with project admin

**Solution:** Contact your company's contact person or project admin.

### Q36: I'm a Contact Person but can't add team members. Why?
**Possible causes:**
1. The person is already on the project
2. The person is from a different company (use "Invite Subcontractor" instead)
3. Permissions issue → Contact admin

**Troubleshooting:**
- Check if user is already in the project members list
- Verify you're using the correct feature (Add Team Member vs Invite Subcontractor)
- Check your contact person status in project settings

### Q37: Someone left our company. How do I remove them from projects?
**A:**
1. If they're regular team member → Contact person can remove them
2. If they're contact person → They must transfer role first
3. If they're already gone → Admin can transfer their contact person role

**Important:** Don't delete their user account if they have historical data (tasks, updates, etc.)

### Q38: A subcontractor's contact person is unresponsive. What can I do?
**A:** Options:
1. **Escalate:** Contact your project admin
2. **Replace:** Admin can change their contact person
3. **Reassign:** Admin can reassign their tasks to someone else
4. **Remove:** As last resort, admin can remove the company from project

---

## 📊 Reporting & Analytics

### Q39: Can I see reports on all subcontractors' work?
**A:** You can see:
- ✅ Tasks assigned to each subcontractor (contact person)
- ✅ Status updates from subcontractors
- ✅ Completion progress
- ✅ Time tracking and costs

You CANNOT see:
- ❌ Internal breakdown of how they organized work
- ❌ Which specific team member did what (unless they tell you)
- ❌ Their internal communication

This is by design - you're paying for results, not micromanaging.

### Q40: Can the project owner generate reports on the entire project?
**A:** Yes! Project owner can see:
- Overall project progress
- Task completion by company
- Budget tracking by contractor
- Timeline adherence
- Issue reports

They cannot see the internal details of how each subcontractor organized their work.

---

## 🔄 Migration & Rollout

### Q41: We have 50 active projects. Do we need to set this up for each?
**A:** No! The migration script automatically:
1. Analyzes existing projects
2. Sets project creators as contact persons
3. Infers company relationships
4. Applies retroactively to all projects

You may need to manually review and adjust some relationships, but bulk is automated.

### Q42: Can we roll this out gradually?
**A:** Yes, suggested rollout:
1. **Phase 1:** Enable for new projects only
2. **Phase 2:** Migrate existing projects (read-only)
3. **Phase 3:** Enable full features for existing projects
4. **Phase 4:** Train users on new features

This minimizes disruption.

### Q43: What training do users need?
**A:** Training varies by role:

**Contact Persons (30 min):**
- How to add team members
- How to invite subcontractors
- How to transfer contact person role
- Visibility rules and why they matter

**Team Members (10 min):**
- Understanding contact person role
- Who they can see and assign tasks to
- How to escalate if needed

**Admins (1 hour):**
- System architecture
- Troubleshooting visibility issues
- Managing contact person transfers
- Edge cases and overrides

---

## 💡 Best Practices

### Q44: Should I always invite people as Contact Person?
**A:** Use this guideline:
- **Contact Person:** First person from external company, or person who will manage their team
- **Regular Member:** Additional team members from same company

**Example:** If hiring "ABC Electric" company:
- Invite their project manager as Contact Person
- Let them add their electricians as team members

### Q45: How do I keep the project organized with many subcontractors?
**Best practices:**
1. **Clear naming:** Use company names clearly
2. **Limit direct reports:** Don't invite 20 subcontractors directly - use tiers
3. **Delegate properly:** Assign tasks to contact persons, not individuals
4. **Document hierarchy:** Keep a project organization chart
5. **Regular reviews:** Check company structure periodically

### Q46: What if requirements change and I need a different contact person?
**A:** Contact person can transfer the role anytime:
1. No approval needed from project owner
2. Takes effect immediately
3. New contact person gets all permissions
4. Old contact person becomes regular team member

This allows companies to adapt to changing project needs.

---

## 📞 Getting Help

### Q47: Where can I get more information?
**Documentation:**
- `CONTACT_PERSON_IMPLEMENTATION_PLAN.md` - Complete technical details
- `CONTACT_PERSON_QUICK_SUMMARY.md` - Quick reference guide
- `CONTACT_PERSON_VISUAL_GUIDE.md` - Visual diagrams and examples
- `CONTACT_PERSON_FAQ.md` - This document

### Q48: I have a use case not covered here. What should I do?
**A:** Please document your use case with:
1. **Scenario:** Describe the situation
2. **Current limitation:** What doesn't work
3. **Desired outcome:** What should happen
4. **Workaround:** Any temporary solutions

Submit as a feature request or discuss with the development team.

### Q49: How do I report a bug with the Contact Person system?
**A:** Report bugs with:
1. **Steps to reproduce:** What you did
2. **Expected behavior:** What should have happened
3. **Actual behavior:** What actually happened
4. **User roles:** Your role and affected user's role
5. **Project context:** Company hierarchy in the project

Include screenshots if possible.

---

*Last Updated: October 22, 2025*
*For technical support, contact the development team*

