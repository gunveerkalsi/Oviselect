import React from 'react';
import { Linkedin } from 'lucide-react';

const TeamMember: React.FC<{ name: string; role: string; description: string; image: string; linkedin: string }> = ({ name, role, description, image, linkedin }) => (
  <div className="flex flex-col items-center text-center p-6 sm:p-8 bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 rounded-3xl hover:shadow-2xl dark:hover:shadow-blue-500/5 hover:-translate-y-2 transition-all duration-500 ease-out group">
    {/* Photo */}
    <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mb-5 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full blur-xl opacity-0 group-hover:opacity-25 dark:group-hover:opacity-35 transition-opacity duration-500" />
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover rounded-full shadow-xl relative z-10 ring-4 ring-white dark:ring-gray-800 group-hover:ring-blue-200 dark:group-hover:ring-blue-900 transition-all duration-300"
      />
    </div>
    <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white mb-1">{name}</h3>
    <span className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">{role}</span>
    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed max-w-xs">{description}</p>
    <div className="opacity-40 group-hover:opacity-100 transition-opacity duration-300">
      <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300">
        <Linkedin size={18} />
      </a>
    </div>
  </div>
);

const Team: React.FC = () => {
  const team = [
    {
      name: 'Mohit P. S. Rathore',
      role: 'Founder & CEO',
      description: 'Building OviSelect to fix the counselling mess he witnessed firsthand. Ex Co-founder HDYUAI & COO CollabClan.',
      image: '/Founder1.jpg',
      linkedin: 'https://www.linkedin.com/in/mohit-pratap-singh-rathore-428b0b27a/',
    },
    {
      name: 'Sriharsha Meduri',
      role: 'Founding Engineer',
      description: 'Building AI systems that turn rank data into confident decisions. Founder PhishingLens & Research Intern IIM Shillong.',
      image: '/Founder2.jpg',
      linkedin: 'https://www.linkedin.com/in/sriharsha-meduri/',
    },
  ];

  return (
    <section id="team" className="py-14 sm:py-20 md:py-28 bg-white dark:bg-black border-t border-gray-100 dark:border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        <div className="text-center mb-12 md:mb-16">
          <span className="text-sm font-bold tracking-widest uppercase text-blue-600 dark:text-blue-400 mb-3 block">The Builders</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 leading-tight">
            Meet the Team<br />
            <span className="text-gray-400 dark:text-gray-500">Behind OviSelect.</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Builders who've seen the broken counselling process up close and decided to fix it with AI and data.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 md:gap-8 max-w-2xl mx-auto">
          {team.map((member, i) => (
            <TeamMember key={i} {...member} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
