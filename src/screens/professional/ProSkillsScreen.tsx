// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   TextInput,
//   Alert,
//   ActivityIndicator,
//   Switch
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
// import { ProStackParamList } from '../../../app/routes/ProNavigator';

// type ProSkillsScreenNavigationProp = NativeStackNavigationProp<ProStackParamList>;

// interface Skill {
//   id: string;
//   name: string;
//   isSelected: boolean;
//   category: string;
//   experience?: number; // in years
//   level?: 'Beginner' | 'Intermediate' | 'Expert';
// }

// interface Certificate {
//   id: string;
//   name: string;
//   issuer: string;
//   date: string;
//   isVerified: boolean;
// }

// const ProSkillsScreen = () => {
//   const navigation = useNavigation<ProSkillsScreenNavigationProp>();
//   const [isLoading, setIsLoading] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [activeTab, setActiveTab] = useState<'skills' | 'certificates'>('skills');
//   const [yearsOfExperience, setYearsOfExperience] = useState(3);
  
//   // Mock data for skills
//   const [skills, setSkills] = useState<Skill[]>([
//     // Car Wash Skills
//     { id: '1', name: 'Exterior Washing', isSelected: true, category: 'Car Wash', experience: 3, level: 'Expert' },
//     { id: '2', name: 'Interior Cleaning', isSelected: true, category: 'Car Wash', experience: 3, level: 'Expert' },
//     { id: '3', name: 'Polishing', isSelected: true, category: 'Car Wash', experience: 2, level: 'Intermediate' },
//     { id: '4', name: 'Waxing', isSelected: true, category: 'Car Wash', experience: 2, level: 'Intermediate' },
//     { id: '5', name: 'Ceramic Coating', isSelected: false, category: 'Car Wash', experience: 1, level: 'Beginner' },
//     { id: '6', name: 'Engine Bay Cleaning', isSelected: true, category: 'Car Wash', experience: 3, level: 'Expert' },
//     { id: '7', name: 'Headlight Restoration', isSelected: false, category: 'Car Wash' },
//     { id: '8', name: 'Undercarriage Cleaning', isSelected: false, category: 'Car Wash' },
    
//     // Bike Wash Skills
//     { id: '9', name: 'Motorcycle Washing', isSelected: true, category: 'Bike Wash', experience: 3, level: 'Expert' },
//     { id: '10', name: 'Chain Cleaning & Lubrication', isSelected: true, category: 'Bike Wash', experience: 3, level: 'Expert' },
//     { id: '11', name: 'Bike Detailing', isSelected: true, category: 'Bike Wash', experience: 2, level: 'Intermediate' },
    
//     // Detailing Skills
//     { id: '12', name: 'Paint Correction', isSelected: false, category: 'Detailing' },
//     { id: '13', name: 'Leather Treatment', isSelected: true, category: 'Detailing', experience: 2, level: 'Intermediate' },
//     { id: '14', name: 'Upholstery Cleaning', isSelected: true, category: 'Detailing', experience: 2, level: 'Intermediate' },
//     { id: '15', name: 'Glass Treatment', isSelected: true, category: 'Detailing', experience: 3, level: 'Expert' },
//   ]);
  
//   // Mock data for certificates
//   const [certificates, setCertificates] = useState<Certificate[]>([
//     { 
//       id: '1', 
//       name: 'Professional Car Detailing', 
//       issuer: 'National Automobile Detailing Association', 
//       date: '2021-05-15', 
//       isVerified: true 
//     },
//     { 
//       id: '2', 
//       name: 'Advanced Ceramic Coating Application', 
//       issuer: 'Auto Care Academy', 
//       date: '2022-02-10', 
//       isVerified: true 
//     },
//     { 
//       id: '3', 
//       name: 'Eco-Friendly Car Wash Techniques', 
//       issuer: 'Green Auto Care Institute', 
//       date: '2022-08-22', 
//       isVerified: false 
//     },
//   ]);
  
//   // Filter skills based on search query
//   const filteredSkills = skills
//     .filter(skill => 
//       skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       skill.category.toLowerCase().includes(searchQuery.toLowerCase())
//     )
//     .sort((a, b) => {
//       // Sort by category first, then by selection status
//       if (a.category !== b.category) {
//         return a.category.localeCompare(b.category);
//       }
//       if (a.isSelected !== b.isSelected) {
//         return a.isSelected ? -1 : 1;
//       }
//       return a.name.localeCompare(b.name);
//     });
  
//   // Group skills by category
//   const skillsByCategory = filteredSkills.reduce<Record<string, Skill[]>>((acc, skill) => {
//     if (!acc[skill.category]) {
//       acc[skill.category] = [];
//     }
//     acc[skill.category].push(skill);
//     return acc;
//   }, {});
  
//   // Get selected skills
//   const selectedSkills = skills.filter(skill => skill.isSelected);
  
//   useEffect(() => {
//     // Simulate loading data
//     setIsLoading(true);
//     setTimeout(() => {
//       setIsLoading(false);
//     }, 1000);
//   }, []);
  
//   const toggleSkillSelection = (id: string) => {
//     setSkills(prevSkills => 
//       prevSkills.map(skill => 
//         skill.id === id ? { ...skill, isSelected: !skill.isSelected } : skill
//       )
//     );
//   };
  
//   const handleSaveChanges = () => {
//     if (selectedSkills.length === 0) {
//       Alert.alert('Error', 'Please select at least one skill.');
//       return;
//     }
    
//     setIsSaving(true);
    
//     // Simulate API call
//     setTimeout(() => {
//       setIsSaving(false);
//       Alert.alert(
//         'Success',
//         'Your skills and expertise have been updated successfully.',
//         [{ text: 'OK', onPress: () => navigation.goBack() }]
//       );
//     }, 1500);
//   };
  
//   const handleAddCertificate = () => {
//     Alert.alert(
//       'Add Certificate',
//       'This feature will allow you to add a new professional certificate. Coming soon!',
//       [{ text: 'OK' }]
//     );
//   };
  
//   const handleDeleteCertificate = (id: string) => {
//     Alert.alert(
//       'Delete Certificate',
//       'Are you sure you want to delete this certificate?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         { 
//           text: 'Delete', 
//           style: 'destructive',
//           onPress: () => {
//             setCertificates(prevCerts => prevCerts.filter(cert => cert.id !== id));
//           }
//         }
//       ]
//     );
//   };
  
//   if (isLoading) {
//     return (
//       <View className="flex-1 items-center justify-center bg-white">
//         <ActivityIndicator size="large" color="#2563EB" />
//         <Text className="text-gray-600 mt-4">Loading skills and certificates...</Text>
//       </View>
//     );
//   }
  
//   return (
//     <View className="flex-1 bg-gray-50">
//       {/* Header */}
//       <View className="bg-primary pt-12 pb-4 px-4">
//         <View className="flex-row items-center">
//           <TouchableOpacity 
//             className="w-10 h-10 items-center justify-center rounded-full bg-white/20"
//             onPress={() => navigation.goBack()}
//           >
//             <Ionicons name="arrow-back" size={20} color="white" />
//           </TouchableOpacity>
//           <Text className="text-white text-xl font-bold ml-4">Skills & Expertise</Text>
//         </View>
//       </View>
      
//       {/* Summary Card */}
//       <View className="bg-white mx-4 rounded-xl shadow-sm p-4 -mt-2">
//         <View className="flex-row justify-between items-center">
//           <Text className="text-gray-800 font-bold text-lg">Your Expertise</Text>
//           <View className="bg-primary/10 px-3 py-1 rounded-full">
//             <Text className="text-primary font-medium">{selectedSkills.length} Skills</Text>
//           </View>
//         </View>
        
//         <View className="flex-row items-center mt-3">
//           <FontAwesome5 name="briefcase" size={14} color="#4B5563" />
//           <Text className="text-gray-600 ml-2">
//             {yearsOfExperience} years of professional experience
//           </Text>
//         </View>
        
//         <View className="flex-row items-center mt-2">
//           <MaterialIcons name="verified" size={16} color="#4B5563" />
//           <Text className="text-gray-600 ml-1">
//             {certificates.filter(c => c.isVerified).length} verified certificates
//           </Text>
//         </View>
//       </View>
      
//       {/* Tabs */}
//       <View className="flex-row mx-4 mt-4 bg-white rounded-xl overflow-hidden">
//         <TouchableOpacity 
//           className={`flex-1 py-3 items-center ${activeTab === 'skills' ? 'bg-primary' : 'bg-white'}`}
//           onPress={() => setActiveTab('skills')}
//         >
//           <Text className={activeTab === 'skills' ? 'text-white font-medium' : 'text-gray-600'}>
//             Skills
//           </Text>
//         </TouchableOpacity>
        
//         <TouchableOpacity 
//           className={`flex-1 py-3 items-center ${activeTab === 'certificates' ? 'bg-primary' : 'bg-white'}`}
//           onPress={() => setActiveTab('certificates')}
//         >
//           <Text className={activeTab === 'certificates' ? 'text-white font-medium' : 'text-gray-600'}>
//             Certificates
//           </Text>
//         </TouchableOpacity>
//       </View>
      
//       {/* Search (only for skills tab) */}
//       {activeTab === 'skills' && (
//         <View className="mx-4 mt-4">
//           <View className="flex-row items-center bg-white rounded-xl shadow-sm px-3 py-2">
//             <Ionicons name="search" size={20} color="#9CA3AF" />
//             <TextInput
//               className="flex-1 ml-2 text-gray-800"
//               placeholder="Search skills..."
//               value={searchQuery}
//               onChangeText={setSearchQuery}
//             />
//             {searchQuery ? (
//               <TouchableOpacity onPress={() => setSearchQuery('')}>
//                 <Ionicons name="close-circle" size={20} color="#9CA3AF" />
//               </TouchableOpacity>
//             ) : null}
//           </View>
//         </View>
//       )}
      
//       {/* Content based on active tab */}
//       <ScrollView className="flex-1 mx-4 mt-4 mb-20">
//         {activeTab === 'skills' ? (
//           // Skills Tab Content
//           <>
//             {Object.entries(skillsByCategory).length === 0 ? (
//               <View className="bg-white rounded-xl shadow-sm p-4 items-center justify-center py-8">
//                 <MaterialIcons name="search-off" size={40} color="#9CA3AF" />
//                 <Text className="text-gray-500 mt-2 text-center">
//                   No skills found matching "{searchQuery}"
//                 </Text>
//                 <TouchableOpacity 
//                   className="mt-4 py-2 px-4 bg-primary rounded-lg"
//                   onPress={() => setSearchQuery('')}
//                 >
//                   <Text className="text-white">Clear Search</Text>
//                 </TouchableOpacity>
//               </View>
//             ) : (
//               Object.entries(skillsByCategory).map(([category, categorySkills]) => (
//                 <View key={category} className="mb-4">
//                   <View className="flex-row items-center mb-2">
//                     <Text className="text-gray-700 font-bold">{category}</Text>
//                     <View className="ml-2 px-2 py-0.5 bg-gray-200 rounded">
//                       <Text className="text-gray-600 text-xs">
//                         {categorySkills.filter(s => s.isSelected).length}/{categorySkills.length}
//                       </Text>
//                     </View>
//                   </View>
                  
//                   <View className="bg-white rounded-xl shadow-sm p-4 mb-4">
//                     {categorySkills.map((skill) => (
//                       <TouchableOpacity 
//                         key={skill.id}
//                         className="flex-row items-center justify-between py-3 border-b border-gray-100"
//                         onPress={() => toggleSkillSelection(skill.id)}
//                       >
//                         <View className="flex-1">
//                           <Text className="text-gray-800 font-medium">{skill.name}</Text>
//                           {skill.level && (
//                             <View className="flex-row items-center mt-1">
//                               <Text className="text-gray-500 text-sm">
//                                 {skill.level} • {skill.experience} {skill.experience === 1 ? 'year' : 'years'}
//                               </Text>
//                             </View>
//                           )}
//                         </View>
                        
//                         <View className={`w-6 h-6 rounded-md items-center justify-center ${skill.isSelected ? 'bg-primary' : 'border border-gray-300'}`}>
//                           {skill.isSelected && <Ionicons name="checkmark" size={16} color="white" />}
//                         </View>
//                       </TouchableOpacity>
//                     ))}
//                   </View>
//                 </View>
//               ))
//             )}
            
//             {/* Experience Section */}
//             <View className="bg-white rounded-xl shadow-sm p-4 mb-4">
//               <Text className="text-gray-800 font-bold mb-3">Years of Experience</Text>
//               <View className="flex-row items-center justify-between mb-1">
//                 <Text className="text-gray-500">1 year</Text>
//                 <Text className="text-gray-500">10+ years</Text>
//               </View>
//               <View className="flex-row items-center">
//                 <TouchableOpacity 
//                   className="w-8 h-8 items-center justify-center rounded-full bg-gray-200"
//                   onPress={() => setYearsOfExperience(Math.max(1, yearsOfExperience - 1))}
//                 >
//                   <Ionicons name="remove" size={20} color="#4B5563" />
//                 </TouchableOpacity>
                
//                 <View className="flex-1 h-2 bg-gray-200 rounded-full mx-2">
//                   <View 
//                     className="h-2 bg-primary rounded-full" 
//                     style={{ width: `${(yearsOfExperience / 10) * 100}%` }}
//                   />
//                 </View>
                
//                 <TouchableOpacity 
//                   className="w-8 h-8 items-center justify-center rounded-full bg-gray-200"
//                   onPress={() => setYearsOfExperience(Math.min(10, yearsOfExperience + 1))}
//                 >
//                   <Ionicons name="add" size={20} color="#4B5563" />
//                 </TouchableOpacity>
//               </View>
//               <Text className="text-center text-gray-700 font-medium mt-2">
//                 {yearsOfExperience} {yearsOfExperience === 1 ? 'year' : 'years'}
//               </Text>
//             </View>
//           </>
//         ) : (
//           // Certificates Tab Content
//           <>
//             <View className="bg-white rounded-xl shadow-sm p-4 mb-4">
//               <TouchableOpacity 
//                 className="flex-row items-center justify-center py-3 border border-primary rounded-lg mb-4"
//                 onPress={handleAddCertificate}
//               >
//                 <Ionicons name="add-circle-outline" size={20} color="#2563EB" />
//                 <Text className="text-primary font-medium ml-2">Add New Certificate</Text>
//               </TouchableOpacity>
              
//               {certificates.length === 0 ? (
//                 <View className="items-center justify-center py-8">
//                   <MaterialIcons name="school" size={40} color="#9CA3AF" />
//                   <Text className="text-gray-500 mt-2 text-center">
//                     You haven't added any certificates yet
//                   </Text>
//                 </View>
//               ) : (
//                 certificates.map((cert) => (
//                   <View 
//                     key={cert.id}
//                     className="border border-gray-200 rounded-lg p-4 mb-3"
//                   >
//                     <View className="flex-row justify-between">
//                       <View className="flex-1">
//                         <Text className="text-gray-800 font-bold">{cert.name}</Text>
//                         <Text className="text-gray-600 mt-1">{cert.issuer}</Text>
//                       </View>
                      
//                       <TouchableOpacity 
//                         className="w-8 h-8 items-center justify-center"
//                         onPress={() => handleDeleteCertificate(cert.id)}
//                       >
//                         <Ionicons name="trash-outline" size={18} color="#EF4444" />
//                       </TouchableOpacity>
//                     </View>
                    
//                     <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100">
//                       <Text className="text-gray-500">
//                         Issued: {new Date(cert.date).toLocaleDateString('en-US', { 
//                           year: 'numeric', 
//                           month: 'short'
//                         })}
//                       </Text>
                      
//                       <View className="flex-row items-center">
//                         {cert.isVerified ? (
//                           <>
//                             <MaterialIcons name="verified" size={16} color="#10B981" />
//                             <Text className="text-green-600 ml-1">Verified</Text>
//                           </>
//                         ) : (
//                           <>
//                             <MaterialIcons name="pending" size={16} color="#F59E0B" />
//                             <Text className="text-amber-600 ml-1">Pending Verification</Text>
//                           </>
//                         )}
//                       </View>
//                     </View>
//                   </View>
//                 ))
//               )}
//             </View>
            
//             <View className="bg-white rounded-xl shadow-sm p-4 mb-4">
//               <Text className="text-gray-800 font-bold mb-2">Why Add Certificates?</Text>
//               <Text className="text-gray-600">
//                 Adding your professional certificates helps build trust with customers and can increase your job opportunities. Verified certificates are prominently displayed on your profile.
//               </Text>
              
//               <View className="mt-4 pt-4 border-t border-gray-100">
//                 <Text className="text-gray-800 font-bold mb-2">Verification Process</Text>
//                 <Text className="text-gray-600">
//                   After adding a certificate, our team will verify its authenticity within 2-3 business days. You may be asked to provide additional documentation.
//                 </Text>
//               </View>
//             </View>
//           </>
//         )}
//       </ScrollView>
      
//       {/* Save Button */}
//       <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
//         <TouchableOpacity 
//           className={`py-3 rounded-lg items-center ${isSaving ? 'bg-primary/70' : 'bg-primary'}`}
//           onPress={handleSaveChanges}
//           disabled={isSaving}
//         >
//           {isSaving ? (
//             <ActivityIndicator color="white" size="small" />
//           ) : (
//             <Text className="text-white font-medium">Save Changes</Text>
//           )}
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// export default ProSkillsScreen;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

// Mock types for self-contained component
type ProStackParamList = {
  ProSkills: undefined;
};

type ProSkillsScreenNavigationProp = NativeStackNavigationProp<ProStackParamList>;

interface Skill {
  id: string;
  name: string;
  isSelected: boolean;
  category: string;
  experoence?:number;
  level?:'Beginner'|'Intermediate'|'Expert';
}

interface Certificate {
  id: string;
  name: string;
  issuer: string;
  date: string;
  isVerified: boolean;
}

const ProSkillsScreen = () => {
  const navigation = useNavigation<ProSkillsScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'skills' | 'certificates'>('skills');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [yearsOfExperience, setYearsOfExperience] = useState(3);
  useEffect(() => {
    const mockSkills: Skill[] = [
      { id: '1', name: 'Exterior Washing', isSelected: true, category: 'Car Wash',  level: 'Expert' },
    { id: '2', name: 'Interior Cleaning', isSelected: true, category: 'Car Wash',  level: 'Expert' },
    { id: '3', name: 'Polishing', isSelected: true, category: 'Car Wash',  level: 'Intermediate' },
    { id: '4', name: 'Waxing', isSelected: true, category: 'Car Wash',  level: 'Intermediate' },
    { id: '5', name: 'Ceramic Coating', isSelected: false, category: 'Car Wash',  level: 'Beginner' },
    { id: '6', name: 'Engine Bay Cleaning', isSelected: true, category: 'Car Wash', level: 'Expert' },
    { id: '7', name: 'Headlight Restoration', isSelected: false, category: 'Car Wash' },
    { id: '8', name: 'Undercarriage Cleaning', isSelected: false, category: 'Car Wash' },
    
    // Bike Wash Skills
    { id: '9', name: 'Motorcycle Washing', isSelected: true, category: 'Bike Wash',  level: 'Expert' },
    { id: '10', name: 'Chain Cleaning & Lubrication', isSelected: true, category: 'Bike Wash',  level: 'Expert' },
    { id: '11', name: 'Bike Detailing', isSelected: true, category: 'Bike Wash',  level: 'Intermediate' },
    
    // Detailing Skills
    { id: '12', name: 'Paint Correction', isSelected: false, category: 'Detailing' },
    { id: '13', name: 'Leather Treatment', isSelected: true, category: 'Detailing',  level: 'Intermediate' },
    { id: '14', name: 'Upholstery Cleaning', isSelected: true, category: 'Detailing',  level: 'Intermediate' },
    { id: '15', name: 'Glass Treatment', isSelected: true, category: 'Detailing', level: 'Expert' },
    ];
    const mockCerts: Certificate[] = [
      { id: '1', name: 'Professional Car Detailing', issuer: 'Auto Detailing Association', date: '2021-05-15', isVerified: true },
      { id: '2', name: 'Advanced Ceramic Coating', issuer: 'Auto Care Academy', date: '2022-02-10', isVerified: true },
    ];
    setTimeout(() => {
      setSkills(mockSkills);
      setCertificates(mockCerts);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredSkills = skills.filter(skill =>
    skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    skill.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const skillsByCategory = filteredSkills.reduce<Record<string, Skill[]>>((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  const selectedSkills = skills.filter(skill => skill.isSelected);

  const toggleSkillSelection = (id: string) => {
    setSkills(prev => prev.map(skill => (skill.id === id ? { ...skill, isSelected: !skill.isSelected } : skill)));
  };

  const handleSaveChanges = () => {
    if (selectedSkills.length === 0) {
      Alert.alert('Error', 'Please select at least one skill.');
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      Alert.alert('Success', 'Your skills have been updated.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    }, 1500);
  };

  if (isLoading) {
    return (
      <View style={styles.centeredScreen}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading skills...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Skills & Expertise</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'skills' && styles.activeTab]} onPress={() => setActiveTab('skills')}>
          <Text style={[styles.tabText, activeTab === 'skills' && styles.activeTabText]}>Skills</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'certificates' && styles.activeTab]} onPress={() => setActiveTab('certificates')}>
          <Text style={[styles.tabText, activeTab === 'certificates' && styles.activeTabText]}>Certificates</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {activeTab === 'skills' && (
          <>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={colors.gray400} />
              <TextInput style={styles.searchInput} placeholder="Search skills..." value={searchQuery} onChangeText={setSearchQuery} />
              {searchQuery ? <TouchableOpacity onPress={() => setSearchQuery('')}><Ionicons name="close-circle" size={20} color={colors.gray400} /></TouchableOpacity> : null}
            </View>
            {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
              <View key={category} style={styles.categoryContainer}>
                <Text style={styles.categoryTitle}>{category}</Text>
                <View style={styles.card}>
                  {categorySkills.map((skill, index) => (
                    <TouchableOpacity key={skill.id} style={[styles.skillItem, index === categorySkills.length - 1 && styles.lastSkillItem]} onPress={() => toggleSkillSelection(skill.id)}>
                      <Text style={styles.skillName}>{skill.name}</Text>
                      <View style={[styles.checkbox, skill.isSelected && styles.checkboxSelected]}>
                        {skill.isSelected && <Ionicons name="checkmark" size={16} color={colors.white} />}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </>
        )}
        {activeTab === 'certificates' && (
            <View style={styles.card}>
                {certificates.map((cert, index) => (
                    <View key={cert.id} style={[styles.skillItem, index === certificates.length - 1 && styles.lastSkillItem]}>
                        <View style={styles.certInfo}>
                            <Text style={styles.skillName}>{cert.name}</Text>
                            <Text style={styles.certIssuer}>{cert.issuer}</Text>
                        </View>
                        <View style={styles.verifiedBadge}>
                            <MaterialIcons name="verified" size={16} color={colors.green600} />
                            <Text style={styles.verifiedText}>Verified</Text>
                        </View>
                    </View>
                ))}
            </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} onPress={handleSaveChanges} disabled={isSaving}>
          {isSaving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const colors = {
  primary: '#2563EB', white: '#FFFFFF', gray50: '#F9FAFB', gray100: '#F3F4F6', gray200: '#E5E7EB', gray300: '#D1D5DB',
  gray400: '#9CA3AF', gray500: '#6B7280', gray600: '#4B5563', gray800: '#1F2937', green600: '#16A34A',
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.gray50 },
  centeredScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  loadingText: { color: colors.gray600, marginTop: 16 },
  header: { backgroundColor: colors.primary, paddingTop: Platform.OS === 'android' ? 24 : 48, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  headerButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  headerTitle: { color: colors.white, fontSize: 20, fontWeight: 'bold', marginLeft: 16 },
  tabContainer: { flexDirection: 'row', backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.gray200 },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText: { color: colors.gray600, fontWeight: '500' },
  activeTabText: { color: colors.primary },
  scrollContainer: { padding: 16, paddingBottom: 100 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 8, paddingHorizontal: 12, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  searchInput: { flex: 1, marginLeft: 8, height: 44, color: colors.gray800 },
  categoryContainer: { marginBottom: 16 },
  categoryTitle: { fontSize: 16, fontWeight: 'bold', color: colors.gray800, marginBottom: 8 },
  card: { backgroundColor: colors.white, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  skillItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  lastSkillItem: { borderBottomWidth: 0 },
  skillName: { fontSize: 16, color: colors.gray800, fontWeight: '500' },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 1.5, borderColor: colors.gray300, alignItems: 'center', justifyContent: 'center' },
  checkboxSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.gray200 },
  saveButton: { paddingVertical: 14, borderRadius: 8, alignItems: 'center', backgroundColor: colors.primary },
  saveButtonDisabled: { backgroundColor: 'rgba(37, 99, 235, 0.7)' },
  saveButtonText: { color: colors.white, fontWeight: 'bold', fontSize: 16 },
  certInfo: { flex: 1 },
  certIssuer: { fontSize: 14, color: colors.gray500, marginTop: 4 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(22, 163, 74, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  verifiedText: { color: colors.green600, marginLeft: 4, fontSize: 12, fontWeight: '500' },
});

export default ProSkillsScreen;
