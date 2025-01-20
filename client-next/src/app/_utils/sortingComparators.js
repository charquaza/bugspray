const statusHierarchy = {
   'open': 1,
   'in progress': 2,
   'complete': 3,
   'closed': 4
};
const statusComparator = (status1, status2) => {
   const rank1 = statusHierarchy[status1.toLowerCase()];
   const rank2 = statusHierarchy[status2.toLowerCase()];

   if (rank1 < rank2) {
      return -1;
   }
   if (rank1 > rank2) {
      return 1;
   }
   return 0;
};

const priorityHierarchy = {
   'high': 1,
   'medium': 2,
   'low': 3
};
const priorityComparator = (priority1, priority2) => {
   const rank1 = priorityHierarchy[priority1.toLowerCase()];
   const rank2 = priorityHierarchy[priority2.toLowerCase()];

   if (rank1 < rank2) {
      return -1;
   }
   if (rank1 > rank2) {
      return 1;
   }
   return 0;
};

export default { 
   status: statusComparator, 
   priority: priorityComparator 
};