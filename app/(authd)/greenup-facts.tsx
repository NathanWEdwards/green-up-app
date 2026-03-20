import moment from 'moment';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import Anchor from '@/components/anchor';
import { getCurrentGreenUpDay } from '@/libs/green-up-day-calculators';
import { isValidDate } from '@/libs/validators';
import {
    selectAboutContactUs,
    selectAboutDate,
    selectAboutDescription,
    selectAboutFaqs,
    selectAboutName
} from '@/store/slices/aboutSlice';
import { defaultStyles } from '@/styles/default-styles';
import { useAppSelector } from '@/store/hooks';

const myStyles = {
    infoBlockContainer: {
        padding: 20,
        marginBottom: 10,
        backgroundColor: '#FFF',
        borderRadius: 5,
        marginHorizontal: 10
    },
    infoBlockHeader: {
        marginBottom: 10
    },
    infoBlock: {
        marginBottom: 10
    },
    headerText: {
        fontSize: 22,
        fontFamily: 'Rubik-Bold',
        textAlign: 'center' as const,
        marginBottom: 5
    },
    textDark: {
        color: '#333'
    },
    bodyText: {
        textAlign: 'justify' as const,
        fontSize: 16
    },
    bodyTextBold: {
        textAlign: 'justify' as const,
        fontSize: 14,
        fontFamily: 'Rubik-Bold'
    },
    titleTextBold: {
        textAlign: 'justify' as const,
        fontSize: 16,
        fontFamily: 'Rubik-Bold'
    },
    poemStanza: {
        textAlign: 'left' as const,
        fontSize: 16,
        marginBottom: 5
    },
    contactText: {
        fontSize: 16
    },
    faqQuestion: {
        textAlign: 'justify' as const,
        fontSize: 18
    },
    faqAnswer: {
        textAlign: 'justify' as const,
        fontSize: 16
    },
    underline: {
        textDecorationLine: 'underline' as const
    },
    linkHint: {
        textAlign: 'center' as const,
        fontWeight: '900' as const,
        fontSize: 16
    },
    essayIntroMargin: {
        marginTop: 10
    }
};

const combinedStyles = { ...defaultStyles, ...myStyles };
const styles = StyleSheet.create(combinedStyles as any);

interface Faq {
    question: string;
    answer: string;
}

interface ContactUs {
    fullName?: string;
    phoneNumber?: string;
    email?: string;
    addressLine1?: string;
    addressLine2?: string;
}

const GreenUpFacts: React.FC = () => {
    const eventDate = useAppSelector(selectAboutDate);
    const eventDescription = useAppSelector(selectAboutDescription);
    const faqs: Faq[] = useAppSelector(selectAboutFaqs);
    const eventName = useAppSelector(selectAboutName);
    const contactUs: ContactUs = useAppSelector(selectAboutContactUs);

    const displayFaqs = Array.isArray(faqs) && faqs.length > 0;

    return (
        <View style={styles.frame}>
            <ScrollView style={styles.scroll}>
                <View style={styles.infoBlockContainer}>
                    <View style={styles.infoBlockHeader}>
                        <Text style={styles.headerText}>{eventName}</Text>
                        <Text style={styles.headerText}>
                            {moment(
                                isValidDate(eventDate)
                                    ? eventDate
                                    : getCurrentGreenUpDay()
                            )
                                .utc()
                                .format('dddd, MMMM Do YYYY')}
                        </Text>
                    </View>
                    <Text
                        style={[styles.textDark, styles.bodyText]}
                        onPress={() => {
                            Linking.openURL('https://greenupvermont.org/');
                        }}
                    >
                        {'\n' + eventDescription + '\n\n'}
                        The latest news and information about the day are always
                        available on the Green Up Vermont website.
                        <Text style={[styles.textDark, styles.linkHint]}>
                            {'\nTap here to open it up if you are online!'}
                        </Text>
                    </Text>
                </View>

                <View style={styles.infoBlockContainer}>
                    <Text style={[styles.textDark, styles.bodyText]}>
                        The 2024 Winning Narrative
                    </Text>
                    <Text style={[styles.textDark, styles.bodyTextBold]}>
                        By Juliette B., 8th Grade, Worcester
                    </Text>
                    <Text style={[styles.textDark, styles.titleTextBold]}>
                        The Importance of Greening Up Our State
                    </Text>
                    <Text style={styles.poemStanza}>
                        I didn&apos;t really think about the environment until
                        it actually impacted me.{'\n'}I was driving to the city
                        with my dad when I noticed the amount of trash on the
                        side of the road{'\n'}
                        The city smelt, the ground was dirty, and it was because
                        no one was taking care of the environment.{'\n'}
                        In Vermont, there&apos;s very few instances where I feel
                        that way.
                        {'\n'}
                        There&apos;s no smell besides the fresh air smell.{'\n'}
                        The ground isn&apos;t littered with trash, it&apos;s
                        littered with plants.
                        {'\n'}
                        If we don&apos;t take care of our environment, our
                        children will have to do it.{'\n'}
                        By then, it&apos;ll be way worse.{'\n'}
                        Global warming, littering, and pollution are serious
                        problems.
                        {'\n'}
                        Even just picking up your trash and sorting it into
                        recycling is helping.{'\n'}
                        It&apos;s the little actions that matter, they&apos;re
                        small, but mighty.
                        {'\n'}
                        As my mom used to say, &quot;If everyone chips in,
                        it&apos;ll make the work easier and faster.&quot;{'\n'}
                        Our global issues might not go away overnight, but if we
                        start now, it&apos;ll go away faster.{'\n'}
                    </Text>
                </View>

                <View style={styles.infoBlockContainer}>
                    <Text style={[styles.textDark, styles.bodyText]}>
                        The 2022 Winning Narrative
                    </Text>
                    <Text style={[styles.textDark, styles.bodyTextBold]}>
                        By Kellan Kendall, 6th Grade, St. Johnsbury Academy
                    </Text>
                    <Text style={[styles.textDark, styles.titleTextBold]}>
                        Green Up Green Mountain State
                    </Text>
                    <Text style={styles.poemStanza}>
                        All Vermonters,{'\n'}
                        Let us lead the way!{'\n'}
                        Clean up bike paths,{'\n'}
                        and roadsides every day!{'\n'}
                    </Text>
                    <Text style={styles.poemStanza}>
                        Make the green mountains clean,{'\n'}
                        Toss trash in the bins.{'\n'}
                        Pick up after ourselves,{'\n'}
                        Every Vermonter wins!{'\n'}
                    </Text>
                    <Text style={styles.poemStanza}>
                        Keep our awesome state clean,{'\n'}
                        Our rivers, ponds, and lakes.{'\n'}
                        Give our loons, trout, and deer,{'\n'}
                        Safe places to live, for all our sakes!{'\n'}
                    </Text>
                    <Text style={styles.poemStanza}>
                        Keep the environment healthy,{'\n'}
                        Let us do our best.{'\n'}
                        Show the country why Vermont,{'\n'}
                        Is better than the rest!{'\n'}
                    </Text>
                    <Text style={styles.poemStanza}>
                        Plant trees and gardens,{'\n'}
                        Recycle old stuff.{'\n'}
                        Take care of the Earth,{'\n'}
                        our planet does enough!{'\n'}
                    </Text>
                    <Text style={styles.poemStanza}>
                        Vermonters stop and listen!{'\n'}
                        Waste has its place.{'\n'}
                        Put it in the garbage,{'\n'}
                        or in the recycling space.{'\n'}
                    </Text>
                    <Text style={styles.poemStanza}>
                        Reduce, Reuse, and Recycle,{'\n'}
                        Be responsible and care.{'\n'}
                        We are excited to clean Vermont up,{'\n'}
                        Litterbugs, BEWARE!{'\n'}
                    </Text>
                    <Text style={styles.poemStanza}>
                        Let&apos;s clean up together,{'\n'}
                        It&apos;s what we want!{'\n'}
                        Treat our state like a champ,{'\n'}
                        Green up the State of Vermont!{'\n'}
                    </Text>
                </View>

                <View style={styles.infoBlockContainer}>
                    <Text style={[styles.textDark, styles.bodyText]}>
                        The 2021 Winning Essay
                    </Text>
                    <Text style={[styles.textDark, styles.bodyTextBold]}>
                        By Casey Kendall, Grade 4, Ryegate, VT
                    </Text>
                    <Text style={[styles.textDark, styles.titleTextBold]}>
                        Green Up, Clean Up!
                    </Text>
                    <Text style={styles.poemStanza}>
                        Green Up means clean up{'\n'}
                        Our pretty state{'\n'}
                        If you are keen to make it green{'\n'}
                        Don&apos;t hesitate, don&apos;t wait!{'\n'}
                    </Text>
                    <Text style={styles.poemStanza}>
                        Making Vermont green can be fun{'\n'}
                        Just grab a friend,{'\n'}
                        Put on a mask,{'\n'}
                        It can be a new trend!{'\n'}
                    </Text>
                    <Text style={styles.poemStanza}>
                        Meet your friends,{'\n'}
                        All you do is pick up trash{'\n'}
                        It&apos;s an activity{'\n'}
                        That doesn&apos;t cost you cash!{'\n'}
                    </Text>
                    <Text style={styles.poemStanza}>
                        Vermont has beautiful mountains{'\n'}
                        And amazing views,{'\n'}
                        There are so many{'\n'}
                        They keep making the news!{'\n'}
                    </Text>
                    <Text style={styles.poemStanza}>
                        Foliage, maple syrup, and more{'\n'}
                        Skiing, boating, fishing, and fun{'\n'}
                        Cleaning up Vermont{'\n'}
                        Keeps us number one!{'\n'}
                    </Text>
                    <Text style={styles.poemStanza}>
                        Vermont is truly the best place{'\n'}
                        To quarantine.{'\n'}
                        And the best place{'\n'}
                        To make things green!{'\n'}
                    </Text>
                    <Text style={styles.poemStanza}>
                        How long has it been?{'\n'}
                        51 amazing years.{'\n'}
                        Keep up the good work{'\n'}
                        So cheers, cheers, cheers!{'\n'}
                    </Text>
                </View>

                <View style={styles.infoBlockContainer}>
                    <Text style={[styles.textDark, styles.bodyText]}>
                        The 2020 Winning Essay
                    </Text>
                    <Text style={[styles.textDark, styles.bodyTextBold]}>
                        By Camryn Crossmon of Chittenden, VT
                    </Text>
                    <Text style={styles.poemStanza}>
                        50 years of greening up and we&apos;re still going
                        strong! The reason Vermonters celebrate Green Up Day is
                        so we can help our community. I feel this event is
                        really important because it makes the environment a
                        better place. Without all that trash around it is much
                        safer, much cleaner, and most of all prettier.
                    </Text>
                    <Text style={styles.poemStanza}>
                        We are called the Green Mountain State for a reason. We
                        have some of the most amazing scenery in the country.
                        The greenery we are famous for gets hidden when our
                        roadways are littered with trash. It&apos;s sad.
                        That&apos;s why it&apos;s important for everyone to
                        pitch in every year on the first Saturday in May so we
                        can live up to our name.
                    </Text>
                    <Text style={styles.poemStanza}>
                        Another reason to take part in Green Up Day is that it
                        shows how people can do things locally to contribute to
                        saving the planet. Cleaning up trash keeps toxins out of
                        our waterways and improves the health of our Earth.
                    </Text>
                    <Text style={styles.poemStanza}>
                        On the next Green Up Day gather your friends and
                        volunteer to clean your local community. You can have
                        fun while helping keep our state beautiful. Plus, if
                        someone sees you doing it they may be inspired to join
                        in!
                    </Text>
                </View>
                {displayFaqs && (
                    <View style={styles.infoBlockContainer}>
                        <Text style={styles.infoBlockHeader}>FAQ&apos;s</Text>
                        <View>
                            {faqs.map((faq: Faq, i: number) => (
                                <View key={i} style={styles.infoBlock}>
                                    <Text
                                        style={[
                                            styles.textDark,
                                            styles.faqQuestion
                                        ]}
                                    >
                                        {faq.question}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.textDark,
                                            styles.faqAnswer
                                        ]}
                                    >
                                        {faq.answer}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
                <View style={styles.infoBlockContainer}>
                    <Text style={styles.infoBlockHeader}>Contact Us</Text>
                    <View style={styles.infoBlock}>
                        <Text style={[styles.textDark, styles.faqQuestion]}>
                            {contactUs.fullName}
                        </Text>
                        <Text style={[styles.textDark, styles.contactText]}>
                            Phone:{' '}
                            <Anchor
                                style={[
                                    styles.textDark,
                                    styles.contactText,
                                    styles.underline
                                ]}
                                href={`tel:${contactUs.phoneNumber}`}
                            >
                                {contactUs.phoneNumber}
                            </Anchor>
                        </Text>
                        <Text style={[styles.textDark, styles.contactText]}>
                            Email:{' '}
                            <Anchor
                                style={[
                                    styles.textDark,
                                    styles.contactText,
                                    styles.underline
                                ]}
                                href={`mailto:${contactUs.email}`}
                            >
                                {contactUs.email}
                            </Anchor>
                        </Text>
                        <Text style={[styles.textDark, styles.contactText]}>
                            By mail:{' '}
                        </Text>
                        <Text style={[styles.textDark, styles.contactText]}>
                            {contactUs.fullName}
                        </Text>
                        <Text style={[styles.textDark, styles.contactText]}>
                            {contactUs.addressLine1}
                        </Text>
                        <Text style={[styles.textDark, styles.contactText]}>
                            {contactUs.addressLine2}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default GreenUpFacts;
